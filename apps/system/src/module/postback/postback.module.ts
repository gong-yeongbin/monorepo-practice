import { Module } from '@nestjs/common';
import { PostbackController } from '@postback/controller';
import { EventPostbackUseCase, InstallPostbackUseCase, PostbackConsumeUseCase } from '@postback/use-case';
import { KafkaModule } from '@core/kafka/kafka.module';
import { PostbackProducerInterceptor } from '@postback/interceptor';
import { POSTBACK_REPOSITORY } from '@postback/domain/symbol';
import { PostbackRepository } from '@postback/infrastructure/postback.repository';

@Module({
	imports: [KafkaModule],
	controllers: [PostbackController],
	providers: [InstallPostbackUseCase, EventPostbackUseCase, PostbackProducerInterceptor, PostbackConsumeUseCase, { provide: POSTBACK_REPOSITORY, useClass: PostbackRepository }],
})
export class PostbackModule {}
