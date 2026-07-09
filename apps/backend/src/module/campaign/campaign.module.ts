import { Module } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';
import { DAILY_STATISTIC_REPOSITORY } from '@campaign/domain/daily-statistic.repository';
import { PrismaCampaignRepository } from '@campaign/infrastructure/prisma-campaign.repository';
import { PrismaDailyStatisticRepository } from '@campaign/infrastructure/prisma-daily-statistic.repository';

@Module({
	providers: [
		{ provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
		{ provide: DAILY_STATISTIC_REPOSITORY, useClass: PrismaDailyStatisticRepository },
	],
	exports: [CAMPAIGN_REPOSITORY, DAILY_STATISTIC_REPOSITORY],
})
export class CampaignModule {}
