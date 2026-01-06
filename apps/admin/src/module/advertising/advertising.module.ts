import { Module } from '@nestjs/common';
import { AdvertisingRepository } from '@module/advertising/infrastructure';
import {
	CreateAdvertisingUseCase,
	GetAdvertiserUseCase,
	GetAdvertisingListUseCase,
	GetAdvertisingUseCase,
	GetCampaignUseCase,
	GetDailyStatisticUseCase,
	GetTrackerUseCase,
	UpdateAdvertisingUseCase,
} from '@module/advertising/use-case';
import { AdvertiserModule } from '@module/advertiser/advertiser.module';
import { TrackerModule } from '@module/tracker/tracker.module';
import { AdvertisingResolver } from '@advertising/controller/advertising.resolver';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/symbol';
import { CAMPAIGN_REPOSITORY, DAILY_STATISTIC_REPOSITORY } from '@campaign/domain/symbol';
import { CampaignRepository, DailyStatisticRepository } from '@campaign/infrastructure';

@Module({
	imports: [AdvertiserModule, TrackerModule],
	providers: [
		AdvertisingResolver,
		CreateAdvertisingUseCase,
		UpdateAdvertisingUseCase,
		GetAdvertisingListUseCase,
		GetAdvertiserUseCase,
		GetTrackerUseCase,
		GetAdvertisingUseCase,
		GetCampaignUseCase,
		GetDailyStatisticUseCase,
		{ provide: ADVERTISING_REPOSITORY, useClass: AdvertisingRepository },
		{ provide: CAMPAIGN_REPOSITORY, useClass: CampaignRepository },
		{ provide: DAILY_STATISTIC_REPOSITORY, useClass: DailyStatisticRepository },
	],
	exports: [ADVERTISING_REPOSITORY],
})
export class AdvertisingModule {}
