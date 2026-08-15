import { Module } from '@nestjs/common';
import { PostbackController } from '@postback/presentation/postback.controller';
import { PostbackLogController } from '@postback/presentation/postback-log.controller';
import { PostbackConsumer } from '@postback/presentation/postback.consumer';
import { InstallPostbackUseCase } from '@postback/application/install-postback.use-case';
import { EventPostbackUseCase } from '@postback/application/event-postback.use-case';
import { PostbackConsumerUseCase } from '@postback/application/postback-consumer.use-case';
import { ListInstallPostbacksUseCase } from '@postback/application/list-install-postbacks.use-case';
import { ListEventPostbacksUseCase } from '@postback/application/list-event-postbacks.use-case';
import { ListUnregisteredPostbacksUseCase } from '@postback/application/list-unregistered-postbacks.use-case';
import { POSTBACK_REPOSITORY } from '@postback/domain/postback.repository';
import { PrismaPostbackRepository } from '@postback/infrastructure/prisma-postback.repository';
import { CAMPAIGN_REPOSITORY } from '@postback/domain/campaign.repository';
import { DAILY_REPORT_REPOSITORY } from '@postback/domain/daily-report.repository';
import { PrismaCampaignRepository } from '@postback/infrastructure/prisma-campaign.repository';
import { PrismaDailyReportRepository } from '@postback/infrastructure/prisma-daily-report.repository';
import { StreamModule } from '@infra/stream/stream.module';

@Module({
	imports: [StreamModule],
	// PostbackController의 :name/install·event 와일드카드가 /postbacks/install·event를 가로채지 않도록
	// 정적 경로인 PostbackLogController를 먼저 등록한다(라우트는 등록 순서대로 매칭됨)
	controllers: [PostbackLogController, PostbackController],
	providers: [
		PostbackConsumer,
		InstallPostbackUseCase,
		EventPostbackUseCase,
		PostbackConsumerUseCase,
		ListInstallPostbacksUseCase,
		ListEventPostbacksUseCase,
		ListUnregisteredPostbacksUseCase,
		{ provide: POSTBACK_REPOSITORY, useClass: PrismaPostbackRepository },
		{ provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
		{ provide: DAILY_REPORT_REPOSITORY, useClass: PrismaDailyReportRepository },
	],
})
export class PostbackModule {}
