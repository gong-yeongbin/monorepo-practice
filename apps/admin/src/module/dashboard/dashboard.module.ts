import { Module } from '@nestjs/common';
import { DashboardController } from '@dashboard/controller';
import { DashboardAdvertisingUseCase, DashboardCampaignUseCase, DashboardMediaUseCase } from '@dashboard/use-case';
import { CampaignModule } from '@campaign/campaign.module';
import { DAILY_STATISTIC_REPOSITORY } from '@dashboard/domain/symbol';
import { DailyStatisticRepository } from '@dashboard/infrastructure/daily-statistic.repository';
import { CookieStrategy } from '@module/auth/strategy/cookie.strategy';

@Module({
	imports: [CampaignModule],
	controllers: [DashboardController],
	providers: [
		DashboardAdvertisingUseCase,
		DashboardCampaignUseCase,
		DashboardMediaUseCase,
		CookieStrategy,
		{ provide: DAILY_STATISTIC_REPOSITORY, useClass: DailyStatisticRepository },
	],
})
export class DashboardModule {}
