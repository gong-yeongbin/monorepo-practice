import { Module } from '@nestjs/common';
import { TrackingController } from '@tracking/presentation/tracking.controller';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';
import { TrackingConsumerUseCase } from '@tracking/application/tracking-consumer.use-case';
import { CampaignModule } from '@campaign/campaign.module';
import { CacheModule } from '@core/cache/cache.module';
import { KafkaModule } from '@core/kafka/kafka.module';

@Module({
	imports: [CampaignModule, CacheModule, KafkaModule],
	controllers: [TrackingController],
	providers: [TrackingUseCase, TrackingConsumerUseCase],
})
export class TrackingModule {}
