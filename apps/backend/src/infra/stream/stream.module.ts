// Redis Stream 프로듀서·컨슈머와 공유 ioredis 연결을 제공하는 NestJS 모듈
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { REDIS_STREAM_CLIENT } from '@infra/stream/redis-stream.constants';
import { StreamProducer } from '@infra/stream/stream-producer.service';
import { StreamConsumer } from '@infra/stream/stream-consumer.service';

@Module({
	providers: [
		{
			provide: REDIS_STREAM_CLIENT,
			inject: [ConfigService],
			// XREADGROUP의 BLOCK 대기 때문에 연결을 캐시 클라이언트와 분리한다
			useFactory: (configService: ConfigService) => new Redis(configService.get<string>('VALKEY') || 'redis://localhost:6379'),
		},
		StreamProducer,
		StreamConsumer,
	],
	exports: [StreamProducer, StreamConsumer],
})
export class StreamModule {}
