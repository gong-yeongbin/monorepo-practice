import { Module } from '@nestjs/common';
import { CampaignController } from '@campaign/presentation/campaign.controller';
import { CreateCampaignUseCase } from '@campaign/application/create-campaign.use-case';
import { DeleteCampaignUseCase } from '@campaign/application/delete-campaign.use-case';
import { UpdateCampaignUseCase } from '@campaign/application/update-campaign.use-case';
import { GetCampaignUseCase } from '@campaign/application/get-campaign.use-case';
import { ListCampaignUseCase } from '@campaign/application/list-campaign.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';
import { PrismaCampaignRepository } from '@campaign/infrastructure/prisma-campaign.repository';

@Module({
	controllers: [CampaignController],
	providers: [
		CreateCampaignUseCase,
		DeleteCampaignUseCase,
		UpdateCampaignUseCase,
		GetCampaignUseCase,
		ListCampaignUseCase,
		{ provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
	],
})
export class CampaignModule {}
