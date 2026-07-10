import { Module } from '@nestjs/common';
import { PostbackController } from '@postback/presentation/postback.controller';
import { InstallPostbackUseCase } from '@postback/application/install-postback.use-case';
import { EventPostbackUseCase } from '@postback/application/event-postback.use-case';
import { PostbackConsumerUseCase } from '@postback/application/postback-consumer.use-case';
import { POSTBACK_REPOSITORY } from '@postback/application/port/postback.repository';
import { PrismaPostbackRepository } from '@postback/infrastructure/prisma-postback.repository';
import { CAMPAIGN_REPOSITORY } from '@postback/domain/campaign.repository';
import { DAILY_REPORT_REPOSITORY } from '@postback/domain/daily-report.repository';
import { PrismaCampaignRepository } from '@postback/infrastructure/prisma-campaign.repository';
import { PrismaDailyReportRepository } from '@postback/infrastructure/prisma-daily-report.repository';
import { KafkaModule } from '@core/kafka/kafka.module';

@Module({
	imports: [KafkaModule],
	controllers: [PostbackController],
	providers: [
		InstallPostbackUseCase,
		EventPostbackUseCase,
		PostbackConsumerUseCase,
		{ provide: POSTBACK_REPOSITORY, useClass: PrismaPostbackRepository },
		{ provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
		{ provide: DAILY_REPORT_REPOSITORY, useClass: PrismaDailyReportRepository },
	],
})
export class PostbackModule {}
