import { Module } from '@nestjs/common';
import { AdvertisingController } from '@module/advertising/controller';
import { AdvertisingRepository } from '@module/advertising/infrastructure';
import { CreateAdvertisingUseCase, UpdateAdvertisingUseCase } from '@module/advertising/use-case';
import { ADVERTISING_REPOSITORY } from '@module/advertising/domain';
import { AdvertiserModule } from '@module/advertiser/advertiser.module';

@Module({
	imports: [AdvertiserModule],
	controllers: [AdvertisingController],
	providers: [CreateAdvertisingUseCase, UpdateAdvertisingUseCase, { provide: ADVERTISING_REPOSITORY, useClass: AdvertisingRepository }],
	exports: [ADVERTISING_REPOSITORY],
})
export class AdvertisingModule {}
