import { Module } from '@nestjs/common';
import { CampaignController } from '@campaign/presentation/campaign.controller';
import { CreateCampaignUseCase } from '@campaign/application/create-campaign.use-case';
import { DeleteCampaignUseCase } from '@campaign/application/delete-campaign.use-case';
import { ToggleCampaignUseCase } from '@campaign/application/toggle-campaign.use-case';
import { GetCampaignUseCase } from '@campaign/application/get-campaign.use-case';
import { ListConfigUseCase } from '@campaign/application/list-config.use-case';
import { ReplaceConfigUseCase } from '@campaign/application/replace-config.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';
import { PrismaCampaignRepository } from '@campaign/infrastructure/prisma-campaign.repository';
import { AuthModule } from '@auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [CampaignController],
	providers: [
		CreateCampaignUseCase,
		DeleteCampaignUseCase,
		ToggleCampaignUseCase,
		GetCampaignUseCase,
		ListConfigUseCase,
		ReplaceConfigUseCase,
		{ provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
	],
})
export class CampaignModule {}
