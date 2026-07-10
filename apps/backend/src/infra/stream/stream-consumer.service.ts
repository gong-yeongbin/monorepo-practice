// Redis Stream을 consumer group으로 소비해 등록된 핸들러로 배치를 전달하는 컨슈머
import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { REDIS_STREAM_CLIENT, STREAM_BLOCK_MS, STREAM_READ_COUNT } from '@infra/stream/redis-stream.constants';

export type BatchHandler = (messages: string[]) => Promise<void>;

@Injectable()
export class StreamConsumer implements OnApplicationBootstrap, OnApplicationShutdown {
	private readonly logger = new Logger(StreamConsumer.name);
	private readonly handlers = new Map<string, BatchHandler>();
	private readonly groupId: string;
	private readonly consumerName: string;
	private running = false;

	constructor(
		@Inject(REDIS_STREAM_CLIENT) private readonly redis: Redis,
		configService: ConfigService
	) {
		this.groupId = configService.get<string>('REDIS_STREAM_GROUP') || 'mecross-system';
		this.consumerName = configService.get<string>('REDIS_STREAM_CONSUMER') || 'consumer-1';
	}

	// 소비 루프는 OnApplicationBootstrap에서 시작하므로 등록은 그 전(OnModuleInit)에 완료되어야 한다
	register(stream: string, handler: BatchHandler) {
		this.handlers.set(stream, handler);
	}

	async onApplicationBootstrap() {
		this.running = true;
		for (const stream of this.handlers.keys()) {
			await this.ensureGroup(stream);
			// 스트림별로 독립 루프를 돌린다(await 하지 않아 서로 블로킹하지 않음)
			void this.consume(stream);
		}
	}

	onApplicationShutdown() {
		this.running = false;
		this.redis.disconnect();
	}

	// 그룹이 이미 있으면 BUSYGROUP 에러가 나므로 무시한다
	private async ensureGroup(stream: string) {
		try {
			await this.redis.xgroup('CREATE', stream, this.groupId, '$', 'MKSTREAM');
		} catch (error) {
			if (!(error instanceof Error && error.message.includes('BUSYGROUP'))) throw error;
		}
	}

	private async consume(stream: string) {
		const handler = this.handlers.get(stream);
		if (!handler) return;

		while (this.running) {
			try {
				const response = await this.redis.xreadgroup(
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
				const streams = response as [string, [string, string[]][]][] | null;
				const entries = streams?.[0]?.[1];
				if (!entries?.length) continue;

				const ids: string[] = [];
				const messages: string[] = [];
				for (const [id, fields] of entries) {
					ids.push(id);
					const value = this.extractData(fields);
					if (value) messages.push(value);
				}

				// 처리 불가능한 메시지로 인한 무한 재소비(poison pill)를 막기 위해 ID는 여기서 모두 ack한다
				await handler(messages);
				await this.redis.xack(stream, this.groupId, ...ids);
			} catch (error) {
				if (!this.running) break;
				this.logger.error(`stream '${stream}' 소비 중 오류: ${String(error)}`);
			}
		}
	}

	// XADD 시 'data' 필드에 넣은 값을 꺼낸다
	private extractData(fields: string[]): string | undefined {
		const index = fields.indexOf('data');
		return index >= 0 ? fields[index + 1] : undefined;
	}
}
