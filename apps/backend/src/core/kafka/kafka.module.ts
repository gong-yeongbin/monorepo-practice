import { Module } from '@nestjs/common';
import { PRODUCER_PORT } from '@core/kafka/producer.port';
import { CONSUMER_PORT } from '@core/kafka/consumer.port';
import { KafkaProducerAdapter } from '@core/kafka/kafka-producer.adapter';
import { KafkaConsumerAdapter } from '@core/kafka/kafka-consumer.adapter';

@Module({
	providers: [
		{ provide: PRODUCER_PORT, useClass: KafkaProducerAdapter },
		{ provide: CONSUMER_PORT, useClass: KafkaConsumerAdapter },
	],
	exports: [PRODUCER_PORT, CONSUMER_PORT],
})
export class KafkaModule {}
