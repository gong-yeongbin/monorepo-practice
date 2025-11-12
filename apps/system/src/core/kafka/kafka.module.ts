import { Module } from '@nestjs/common';
import { CONSUMER, PRODUCER } from '@core/kafka/symbol';
import { ConsumerRepository, ProducerRepository } from '@core/kafka/repository';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [ConfigModule],
	providers: [
		{ provide: PRODUCER, useClass: ProducerRepository },
		{ provide: CONSUMER, useClass: ConsumerRepository },
	],
	exports: [PRODUCER, CONSUMER],
})
export class KafkaModule {}
