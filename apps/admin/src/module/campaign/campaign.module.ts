import { Module } from '@nestjs/common';
import { AdvertisingModule } from '@advertising/advertising.module';
import { MediaModule } from '@media/media.module';
import { CampaignResolver } from '@campaign/controller';
import { CreateCampaignUseCase, GetCampaignUseCase, UpsertCampaignConfigUseCase, UpdateCampaignUseCase, GetCampaignConfigUseCase } from '@campaign/use-case';
import { CAMPAIGN_CONFIG_REPOSITORY, CAMPAIGN_REPOSITORY } from '@campaign/domain/symbol';
import { CampaignConfigRepository, CampaignRepository } from '@campaign/infrastructure';

@Module({
	imports: [AdvertisingModule, MediaModule],
	providers: [
		CampaignResolver,
		CreateCampaignUseCase,
		UpdateCampaignUseCase,
		GetCampaignUseCase,
		GetCampaignConfigUseCase,
		UpsertCampaignConfigUseCase,
		{ provide: CAMPAIGN_REPOSITORY, useClass: CampaignRepository },
		{ provide: CAMPAIGN_CONFIG_REPOSITORY, useClass: CampaignConfigRepository },
	],
	exports: [CAMPAIGN_REPOSITORY],
})
export class CampaignModule {}
