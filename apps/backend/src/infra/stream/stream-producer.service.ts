// Redis Stream에 메시지를 발행하는 프로듀서(XADD 래퍼)
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_STREAM_CLIENT } from '@infra/stream/redis-stream.constants';

@Injectable()
export class StreamProducer {
	constructor(@Inject(REDIS_STREAM_CLIENT) private readonly redis: Redis) {}

	// 메시지 본문은 'data' 필드에 담고, ID는 Redis가 자동 채번(*)하도록 한다
	async send(stream: string, message: string): Promise<void> {
		await this.redis.xadd(stream, '*', 'data', message);
	}
}
