import { Module } from '@nestjs/common';
import { CampaignController } from '@module/campaign/controller';
import { CAMPAIGN_CONFIG_REPOSITORY, CAMPAIGN_REPOSITORY } from '@module/campaign/domain/symbol';
import { CampaignConfigRepository, CampaignRepository } from '@module/campaign/infrastructure';
import { AdvertisingModule } from '@module/advertising/advertising.module';
import { TrackerModule } from '@module/tracker/tracker.module';
import { MediaModule } from '@module/media/media.module';
import { CreateCampaignUseCase, GetCampaignUseCase, UpdateCampaignConfigUseCase } from '@module/campaign/use-case';

@Module({
	imports: [TrackerModule, AdvertisingModule, MediaModule],
	controllers: [CampaignController],
	providers: [
		CreateCampaignUseCase,
		GetCampaignUseCase,
		UpdateCampaignConfigUseCase,
		{ provide: CAMPAIGN_REPOSITORY, useClass: CampaignRepository },
		{ provide: CAMPAIGN_CONFIG_REPOSITORY, useClass: CampaignConfigRepository },
	],
})
export class CampaignModule {}
