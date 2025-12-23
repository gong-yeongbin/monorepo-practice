import { Module } from '@nestjs/common';
import { AdvertiserResolver } from '@advertiser/controller';
import { CreateAdvertiserUseCase, GetAdvertisersUseCase, UpdateAdvertiserUseCase } from '@advertiser/use-case';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/symbol';
import { AdvertiserRepository } from '@advertiser/infrastructure';

@Module({
	providers: [AdvertiserResolver, CreateAdvertiserUseCase, GetAdvertisersUseCase, UpdateAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useClass: AdvertiserRepository }],
	exports: [ADVERTISER_REPOSITORY],
})
export class AdvertiserModule {}
