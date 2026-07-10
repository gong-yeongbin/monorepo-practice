import { Module } from '@nestjs/common';
import { TrackingController } from '@tracking/presentation/tracking.controller';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';
import { TrackingConsumerUseCase } from '@tracking/application/tracking-consumer.use-case';
import { CAMPAIGN_REPOSITORY } from '@tracking/domain/campaign.repository';
import { DAILY_REPORT_REPOSITORY } from '@tracking/domain/daily-report.repository';
import { PrismaCampaignRepository } from '@tracking/infrastructure/prisma-campaign.repository';
import { PrismaDailyReportRepository } from '@tracking/infrastructure/prisma-daily-report.repository';
import { CacheModule } from '@core/cache/cache.module';
import { KafkaModule } from '@core/kafka/kafka.module';

@Module({
	imports: [CacheModule, KafkaModule],
	controllers: [TrackingController],
	providers: [
		TrackingUseCase,
		TrackingConsumerUseCase,
		{ provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
		{ provide: DAILY_REPORT_REPOSITORY, useClass: PrismaDailyReportRepository },
	],
})
export class TrackingModule {}
