import { Module } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, DAILY_STATISTIC_REPOSITORY } from '@tracking/domain/symbol';
import { CampaignRepository, DailyStatisticRepository } from '@tracking/infrastructure';
import { TrackingController } from '@tracking/controller';
import { TrackingConsumerUseCase, TrackingUseCase } from '@tracking/use-case';
import { CacheModule } from '@src/core/cache/cache.module';
import { KafkaModule } from '@core/kafka/kafka.module';

@Module({
	imports: [CacheModule, KafkaModule],
	controllers: [TrackingController],
	providers: [
		TrackingUseCase,
		TrackingConsumerUseCase,
		{ provide: CAMPAIGN_REPOSITORY, useClass: CampaignRepository },
		{ provide: DAILY_STATISTIC_REPOSITORY, useClass: DailyStatisticRepository },
	],
	exports: [CAMPAIGN_REPOSITORY, DAILY_STATISTIC_REPOSITORY],
})
export class TrackingModule {}
