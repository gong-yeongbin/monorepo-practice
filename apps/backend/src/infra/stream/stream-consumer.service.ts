// Redis Stream을 consumer group으로 소비해 등록된 핸들러로 배치를 전달하는 컨슈머
import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { hostname } from 'os';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import {
	REDIS_STREAM_CLIENT,
	STREAM_BLOCK_MS,
	STREAM_CLAIM_MIN_IDLE_MS_DEFAULT,
	STREAM_MAX_DELIVERIES,
	STREAM_READ_COUNT,
} from '@infra/stream/redis-stream.constants';

// 핸들러 계약: 개별 건 실패는 내부에서 격리(Promise.allSettled)하고, 배치 전체를 재처리해야 하는
// 인프라 장애 시에만 throw한다. throw 시 ack하지 않아 재전달(at-least-once)될 수 있으므로 멱등성에 유의.
export type BatchHandler = (messages: string[]) => Promise<void>;

type StreamEntry = [string, string[]];

@Injectable()
export class StreamConsumer implements OnApplicationBootstrap, OnApplicationShutdown {
	private readonly logger = new Logger(StreamConsumer.name);
	private readonly handlers = new Map<string, BatchHandler>();
	private readonly claimCursors = new Map<string, string>();
	private readonly loops: Promise<void>[] = [];
	private readonly groupId: string;
	private readonly consumerName: string;
	private readonly claimMinIdleMs: number;
	private readonly role: string;
	private running = false;
	// XREADGROUP BLOCK이 연결을 점유하므로, 자동 파이프라이닝되는 공유 클라이언트와 분리한 블로킹 전용 연결
	private blocking?: Redis;

	constructor(
		@Inject(REDIS_STREAM_CLIENT) private readonly redis: Redis,
		configService: ConfigService
	) {
		this.groupId = configService.get<string>('REDIS_STREAM_GROUP') || 'mecross-system';
		// 프로세스마다 고유한 이름을 써야 재시작·다중 기동 시 그룹 내 이름이 충돌하지 않는다.
		// 버려진 이름의 PEL은 XAUTOCLAIM이 회수한다.
		this.consumerName = configService.get<string>('REDIS_STREAM_CONSUMER') || `consumer-${hostname()}-${process.pid}`;
		this.claimMinIdleMs = Number(configService.get('STREAM_CLAIM_MIN_IDLE_MS')) || STREAM_CLAIM_MIN_IDLE_MS_DEFAULT;
		this.role = configService.get<string>('APP_ROLE') || 'all';
	}

	// 소비 루프는 OnApplicationBootstrap에서 시작하므로 등록은 그 전(OnModuleInit)에 완료되어야 한다
	register(stream: string, handler: BatchHandler) {
		this.handlers.set(stream, handler);
	}

	async onApplicationBootstrap() {
		// API 전용 프로세스(APP_ROLE=api)는 소비 루프를 돌리지 않는다(컨슈머 프로세스 분리)
		if (this.role === 'api') return;

		this.blocking = this.redis.duplicate({ enableAutoPipelining: false });
		this.running = true;
		for (const stream of this.handlers.keys()) {
			await this.ensureGroup(stream);
			// 스트림별로 독립 루프를 돌린다(await 하지 않아 서로 블로킹하지 않음). shutdown에서 완료를 기다리기 위해 보관한다.
			this.loops.push(this.consume(stream));
		}
	}

	async onApplicationShutdown() {
		this.running = false;
		// 진행 중인 배치가 끝난 뒤(BLOCK 5초 내 루프 종료) 연결을 닫아 in-flight 유실을 막는다
		await Promise.all(this.loops);
		await this.quitClient(this.blocking);
		await this.quitClient(this.redis);
	}

	private async quitClient(client?: Redis) {
		if (!client) return;
		try {
			await client.quit();
		} catch {
			client.disconnect();
		}
	}

	// 그룹이 이미 있으면 BUSYGROUP 에러가 나므로 무시한다
	private async ensureGroup(stream: string) {
		try {
			await this.blocking!.xgroup('CREATE', stream, this.groupId, '$', 'MKSTREAM');
		} catch (error) {
			if (!(error instanceof Error && error.message.includes('BUSYGROUP'))) throw error;
		}
	}

	private async consume(stream: string) {
		const handler = this.handlers.get(stream);
		if (!handler) return;

		while (this.running) {
			try {
				// 다른(죽은) 컨슈머가 ack하지 못하고 남긴 PEL 메시지를 회수해 먼저 처리한다
				await this.reclaimIdle(stream, handler);

				const response = await this.blocking!.xreadgroup(
					'GROUP',
					this.groupId,
					this.consumerName,
					'COUNT',
					STREAM_READ_COUNT,
					'BLOCK',
					STREAM_BLOCK_MS,
					'STREAMS',
					stream,
					'>'
				);
				// xreadgroup 응답 구조: [[streamName, [[id, [field, value, ...]], ...]]], 타임아웃이면 null
				const streams = response as [string, StreamEntry[]][] | null;
				const entries = streams?.[0]?.[1];
				if (!entries?.length) continue;

				await this.processBatch(stream, handler, entries);
			} catch (error) {
				if (!this.running) break;
				this.logger.error(`stream '${stream}' 소비 중 오류: ${String(error)}`);
			}
		}
	}

	// 핸들러 성공 시에만 ack한다. 실패한 배치는 PEL에 남아 XAUTOCLAIM으로 재전달된다.
	private async processBatch(stream: string, handler: BatchHandler, entries: StreamEntry[]) {
		const ids = entries.map(([id]) => id);
		const messages = entries.map(([, fields]) => this.extractData(fields)).filter((value): value is string => value !== undefined);

		await handler(messages);
		await this.blocking!.xack(stream, this.groupId, ...ids);
	}

	private async reclaimIdle(stream: string, handler: BatchHandler) {
		const cursor = this.claimCursors.get(stream) ?? '0';
		const response = (await this.blocking!.xautoclaim(stream, this.groupId, this.consumerName, this.claimMinIdleMs, cursor, 'COUNT', STREAM_READ_COUNT)) as [
			string,
			(StreamEntry | null)[],
			...unknown[],
		];
		this.claimCursors.set(stream, response[0]);

		// 트림 등으로 본문이 사라진 엔트리(null)는 제외한다
		const entries = response[1].filter((entry): entry is StreamEntry => entry !== null);
		if (!entries.length) return;

		// 전달 횟수가 임계 이상인 메시지는 처리하지 않고 ack로 폐기해 무한 재소비(poison pill)를 막는다
		const deliveryCounts = await this.getDeliveryCounts(stream, entries.map(([id]) => id));
		const poison = entries.filter(([id]) => (deliveryCounts.get(id) ?? 0) >= STREAM_MAX_DELIVERIES);
		const retryable = entries.filter(([id]) => (deliveryCounts.get(id) ?? 0) < STREAM_MAX_DELIVERIES);

		if (poison.length) {
			this.logger.error(`stream '${stream}' 최대 전달 횟수(${STREAM_MAX_DELIVERIES}) 초과로 폐기: ${poison.map(([id]) => id).join(', ')}`);
			await this.blocking!.xack(stream, this.groupId, ...poison.map(([id]) => id));
		}
		if (retryable.length) await this.processBatch(stream, handler, retryable);
	}

	// XPENDING 확장 형태로 각 메시지의 전달 횟수를 조회한다
	private async getDeliveryCounts(stream: string, ids: string[]): Promise<Map<string, number>> {
		const [first, last] = [ids[0], ids[ids.length - 1]];
		if (!first || !last) return new Map();
		const pending = (await this.blocking!.xpending(stream, this.groupId, first, last, ids.length)) as [string, string, number, number][];
		return new Map(pending.map(([id, , , deliveryCount]) => [id, deliveryCount]));
	}

	// XADD 시 'data' 필드에 넣은 값을 꺼낸다
	private extractData(fields: string[]): string | undefined {
		const index = fields.indexOf('data');
		return index >= 0 ? fields[index + 1] : undefined;
	}
}
