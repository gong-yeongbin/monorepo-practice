import { Module } from '@nestjs/common';
import { PostbackController } from '@postback/presentation/postback.controller';
import { InstallPostbackUseCase } from '@postback/application/install-postback.use-case';
import { EventPostbackUseCase } from '@postback/application/event-postback.use-case';
import { PostbackConsumerUseCase } from '@postback/application/postback-consumer.use-case';
import { POSTBACK_REPOSITORY } from '@postback/application/port/postback.repository';
import { PrismaPostbackRepository } from '@postback/infrastructure/prisma-postback.repository';
import { CampaignModule } from '@campaign/campaign.module';
import { KafkaModule } from '@core/kafka/kafka.module';

@Module({
	imports: [CampaignModule, KafkaModule],
	controllers: [PostbackController],
	providers: [InstallPostbackUseCase, EventPostbackUseCase, PostbackConsumerUseCase, { provide: POSTBACK_REPOSITORY, useClass: PrismaPostbackRepository }],
})
export class PostbackModule {}
