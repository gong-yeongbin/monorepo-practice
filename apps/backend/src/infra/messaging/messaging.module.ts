import { Module } from '@nestjs/common';
import { PRODUCER_PORT } from '@infra/messaging/producer.port';
import { CONSUMER_PORT } from '@infra/messaging/consumer.port';
import { KafkaProducerAdapter } from '@infra/messaging/kafka-producer.adapter';
import { KafkaConsumerAdapter } from '@infra/messaging/kafka-consumer.adapter';

@Module({
	providers: [
		{ provide: PRODUCER_PORT, useClass: KafkaProducerAdapter },
		{ provide: CONSUMER_PORT, useClass: KafkaConsumerAdapter },
	],
	exports: [PRODUCER_PORT, CONSUMER_PORT],
})
export class MessagingModule {}
