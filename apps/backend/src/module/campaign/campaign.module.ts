import { Module } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';
import { DAILY_REPORT_REPOSITORY } from '@campaign/domain/daily-report.repository';
import { PrismaCampaignRepository } from '@campaign/infrastructure/prisma-campaign.repository';
import { PrismaDailyReportRepository } from '@campaign/infrastructure/prisma-daily-report.repository';

@Module({
	providers: [
		{ provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
		{ provide: DAILY_REPORT_REPOSITORY, useClass: PrismaDailyReportRepository },
	],
	exports: [CAMPAIGN_REPOSITORY, DAILY_REPORT_REPOSITORY],
})
export class CampaignModule {}
