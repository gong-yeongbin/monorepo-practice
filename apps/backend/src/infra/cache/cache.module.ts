// 캐시용 ioredis 연결과 캐시 포트 어댑터를 제공하는 NestJS 모듈
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { CACHE_PORT } from '@infra/cache/cache.port';
import { REDIS_CACHE_CLIENT } from '@infra/cache/cache.constants';
import { RedisCacheAdapter } from '@infra/cache/redis-cache.adapter';

@Module({
	providers: [
		{
			provide: REDIS_CACHE_CLIENT,
			inject: [ConfigService],
			// 스트림 컨슈머의 BLOCK 대기와 간섭하지 않도록 캐시 전용 연결을 별도로 둔다
			useFactory: (configService: ConfigService) => new Redis(configService.get<string>('VALKEY') || 'redis://localhost:6379'),
		},
		{ provide: CACHE_PORT, useClass: RedisCacheAdapter },
	],
	exports: [CACHE_PORT],
})
export class CacheModule {}
