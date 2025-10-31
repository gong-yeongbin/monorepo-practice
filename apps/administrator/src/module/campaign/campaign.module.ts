import { Module } from '@nestjs/common';
import { CampaignController } from '@module/campaign/controller';
import { CAMPAIGN_REPOSITORY } from '@module/campaign/domain/symbol';
import { CampaignRepository } from '@module/campaign/infrastructure';
import { AdvertisingModule } from '@module/advertising/advertising.module';
import { TrackerModule } from '@module/tracker/tracker.module';
import { MediaModule } from '@module/media/media.module';
import { CreateCampaignUseCase, GetCampaignListUseCase, GetCampaignUseCase } from '@module/campaign/use-case';

@Module({
	imports: [TrackerModule, AdvertisingModule, MediaModule],
	controllers: [CampaignController],
	providers: [CreateCampaignUseCase, GetCampaignUseCase, GetCampaignListUseCase, { provide: CAMPAIGN_REPOSITORY, useClass: CampaignRepository }],
})
export class CampaignModule {}
