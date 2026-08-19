// Redis Stream에 메시지를 발행하는 프로듀서(XADD 래퍼)
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { REDIS_STREAM_CLIENT, STREAM_MAXLEN_DEFAULT } from '@infra/stream/redis-stream.constants';

@Injectable()
export class StreamProducer {
	private readonly maxlen: number;

	constructor(
		@Inject(REDIS_STREAM_CLIENT) private readonly redis: Redis,
		configService: ConfigService
	) {
		this.maxlen = Number(configService.get('REDIS_STREAM_MAXLEN')) || STREAM_MAXLEN_DEFAULT;
	}

	// 메시지 본문은 'data' 필드에 담고, ID는 Redis가 자동 채번(*)하도록 한다.
	// MAXLEN ~로 스트림 길이를 제한한다 — 컨슈머가 장기간 다운되면 미소비 메시지도 트림될 수 있음을 감수한다.
	async send(stream: string, message: string): Promise<void> {
		await this.redis.xadd(stream, 'MAXLEN', '~', this.maxlen, '*', 'data', message);
	}
}
