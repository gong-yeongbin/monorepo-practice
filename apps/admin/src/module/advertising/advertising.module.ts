import { Module } from '@nestjs/common';
import { AdvertisingRepository } from '@module/advertising/infrastructure';
import { CreateAdvertisingUseCase, GetAdvertisingListUseCase, GetAdvertisingUseCase, GetCampaignListUseCase, UpdateAdvertisingUseCase } from '@module/advertising/use-case';
import { AdvertiserModule } from '@module/advertiser/advertiser.module';
import { TrackerModule } from '@module/tracker/tracker.module';
import { AdvertisingResolver } from '@advertising/controller/advertising.resolver';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/symbol';

@Module({
	imports: [AdvertiserModule, TrackerModule],
	providers: [
		AdvertisingResolver,
		CreateAdvertisingUseCase,
		UpdateAdvertisingUseCase,
		GetAdvertisingListUseCase,
		GetAdvertisingUseCase,
		GetCampaignListUseCase,
		{ provide: ADVERTISING_REPOSITORY, useClass: AdvertisingRepository },
	],
	exports: [ADVERTISING_REPOSITORY],
})
export class AdvertisingModule {}
