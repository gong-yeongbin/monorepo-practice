import { Module } from '@nestjs/common';
import { AdvertisingModule } from '@advertising/advertising.module';
import { MediaModule } from '@media/media.module';
import { CampaignResolver } from '@campaign/controller';
import {
	CreateCampaignUseCase,
	GetCampaignUseCase,
	UpsertCampaignConfigUseCase,
	UpdateCampaignUseCase,
	GetCampaignConfigUseCase,
	GetMediaUseCase,
	GetDailyStatisticsUseCase,
} from '@campaign/use-case';
import { CAMPAIGN_CONFIG_REPOSITORY, CAMPAIGN_REPOSITORY, DAILY_STATISTIC_REPOSITORY } from '@campaign/domain/symbol';
import { CampaignConfigRepository, CampaignRepository, DailyStatisticRepository } from '@campaign/infrastructure';

@Module({
	imports: [AdvertisingModule, MediaModule],
	providers: [
		CampaignResolver,
		CreateCampaignUseCase,
		UpdateCampaignUseCase,
		GetCampaignUseCase,
		GetCampaignConfigUseCase,
		UpsertCampaignConfigUseCase,
		GetMediaUseCase,
		GetDailyStatisticsUseCase,
		{ provide: CAMPAIGN_REPOSITORY, useClass: CampaignRepository },
		{ provide: CAMPAIGN_CONFIG_REPOSITORY, useClass: CampaignConfigRepository },
		{ provide: DAILY_STATISTIC_REPOSITORY, useClass: DailyStatisticRepository },
	],
	exports: [CAMPAIGN_REPOSITORY],
})
export class CampaignModule {}
