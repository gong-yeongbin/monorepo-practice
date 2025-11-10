import { Module } from '@nestjs/common';
import { KafkaProducerService } from '@core/kafka/kafka-producer.service';
import { KafkaConsumerService } from '@core/kafka/kafka-consumer.service';

@Module({
	providers: [KafkaProducerService, KafkaConsumerService],
	exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}
