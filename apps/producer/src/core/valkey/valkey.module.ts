import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { ValkeyService } from './valkey.service';
import { ValkeyAdapter } from './valkey.adapter';

@Global()
@Module({
	imports: [
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule.forRoot()],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				return {
					stores: [new KeyvRedis(configService.get<string>('VALKEY'))],
				};
			},
		}),
	],
	providers: [{ provide: ValkeyService, useClass: ValkeyAdapter }],
})
export class ValkeyModule {}
