import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { CACHE_PORT } from '@infra/cache/cache.port';
import { RedisCacheAdapter } from '@infra/cache/redis-cache.adapter';

@Module({
	imports: [
		NestCacheModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					stores: [new KeyvRedis(configService.get<string>('VALKEY'))],
				};
			},
		}),
	],
	providers: [{ provide: CACHE_PORT, useClass: RedisCacheAdapter }],
	exports: [CACHE_PORT],
})
export class CacheModule {}
