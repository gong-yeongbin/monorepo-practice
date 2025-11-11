import { Module } from '@nestjs/common';
import { PostbackController } from '@postback/controller';
import { EventPostbackUseCase, InstallPostbackUseCase, PostbackConsumerUseCase } from '@postback/use-case';
import { POSTBACK_REPOSITORY } from '@postback/domain/symbol';
import { PostbackRepository } from '@postback/infrastructure/postback.repository';
import { TrackingModule } from '@src/module';
import { KafkaModule } from '@core/kafka/kafka.module';

@Module({
	imports: [TrackingModule, KafkaModule],
	controllers: [PostbackController],
	providers: [InstallPostbackUseCase, EventPostbackUseCase, PostbackConsumerUseCase, { provide: POSTBACK_REPOSITORY, useClass: PostbackRepository }],
})
export class PostbackModule {}
