import { Module } from '@nestjs/common';
import { AdvertiserController } from '@module/advertiser/controller';
import { ADVERTISER_REPOSITORY } from '@module/advertiser/domain/symbol';
import { AdvertiserRepository } from '@module/advertiser/infrastructure';
import { CreateAdvertiserUseCase, GetAdvertiserListUseCase, PatchAdvertiserUseCase } from '@module/advertiser/use-case';

@Module({
	controllers: [AdvertiserController],
	providers: [CreateAdvertiserUseCase, GetAdvertiserListUseCase, PatchAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useClass: AdvertiserRepository }],
	exports: [ADVERTISER_REPOSITORY],
})
export class AdvertiserModule {}
