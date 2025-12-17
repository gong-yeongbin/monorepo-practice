import { Module } from '@nestjs/common';
import { AdvertiserResolver } from '@module/advertiser/controller';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { AdvertiserRepository } from '@module/advertiser/infrastructure';
import { CreateAdvertiserUseCase, GetAdvertisersUseCase, UpdateAdvertiserUseCase } from '@module/advertiser/use-case';

@Module({
	providers: [AdvertiserResolver, CreateAdvertiserUseCase, GetAdvertisersUseCase, UpdateAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useClass: AdvertiserRepository }],
	exports: [ADVERTISER_REPOSITORY],
})
export class AdvertiserModule {}
