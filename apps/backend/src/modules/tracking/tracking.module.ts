import { Module } from '@nestjs/common';
import { TrackingController } from '@tracking/presentation/tracking.controller';
import { TrackingModeController } from '@tracking/presentation/tracking-mode.controller';
import { TrackingConsumer } from '@tracking/presentation/tracking.consumer';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';
import { TrackingModeUseCase } from '@tracking/application/tracking-mode.use-case';
import { TrackingConsumerUseCase } from '@tracking/application/tracking-consumer.use-case';
import { CAMPAIGN_REPOSITORY } from '@tracking/domain/campaign.repository';
import { DAILY_REPORT_REPOSITORY } from '@tracking/domain/daily-report.repository';
import { PrismaCampaignRepository } from '@tracking/infrastructure/prisma-campaign.repository';
import { PrismaDailyReportRepository } from '@tracking/infrastructure/prisma-daily-report.repository';
import { CacheModule } from '@infra/cache/cache.module';
import { StreamModule } from '@infra/stream/stream.module';

@Module({
	imports: [CacheModule, StreamModule],
	controllers: [TrackingController, TrackingModeController],
	providers: [
		TrackingConsumer,
		TrackingUseCase,
		// 모드 값을 태스크 메모리에 캐시하므로 싱글턴 인스턴스가 가드와 컨트롤러에 공유돼야 한다
		TrackingModeUseCase,
		TrackingConsumerUseCase,
		{ provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
		{ provide: DAILY_REPORT_REPOSITORY, useClass: PrismaDailyReportRepository },
	],
})
export class TrackingModule {}
