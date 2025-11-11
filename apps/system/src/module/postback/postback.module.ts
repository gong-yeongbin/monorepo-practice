import { Module } from '@nestjs/common';
import { PostbackController } from '@postback/controller';
import { EventPostbackUseCase, InstallPostbackUseCase, PostbackConsumerUseCase } from '@postback/use-case';
import { KafkaModule } from '@core/kafka/kafka.module';
import { PostbackProducerInterceptor } from '@postback/interceptor';
import { POSTBACK_REPOSITORY } from '@postback/domain/symbol';
import { PostbackRepository } from '@postback/infrastructure/postback.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_OPTION } from '@src/main';
import { TrackingModule } from '@src/module';

@Module({
	imports: [
		TrackingModule,
		ClientsModule.register([
			{
				name: 'KAFKA_SERVICE',
				transport: Transport.KAFKA,
				options: KAFKA_OPTION,
			},
		]),
	],
	controllers: [PostbackController],
	providers: [InstallPostbackUseCase, EventPostbackUseCase, PostbackConsumerUseCase, { provide: POSTBACK_REPOSITORY, useClass: PostbackRepository }],
})
export class PostbackModule {}
