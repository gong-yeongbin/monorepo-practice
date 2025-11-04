import { Module } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '@tracking/domain/symbol';
import { CampaignRepository } from '@tracking/infrastructure';
import { TrackingController } from '@tracking/controller';
import { TrackingUseCase } from '@tracking/use-case';

@Module({
	controllers: [TrackingController],
	providers: [TrackingUseCase, { provide: CAMPAIGN_REPOSITORY, useClass: CampaignRepository }],
})
export class TrackingModule {}
