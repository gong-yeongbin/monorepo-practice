import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { CACHE_REPOSITORY } from '@src/core/cache/domain/symbol';
import { CacheRepository } from '@src/core/cache/infrastructure';

@Module({
	imports: [
		NestCacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule.forRoot()],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					stores: [new KeyvRedis(configService.get<string>('VALKEY'))],
				};
			},
		}),
	],
	providers: [{ provide: CACHE_REPOSITORY, useClass: CacheRepository }],
	exports: [CACHE_REPOSITORY],
})
export class CacheModule {}
