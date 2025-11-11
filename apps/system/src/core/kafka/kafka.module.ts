import { Module } from '@nestjs/common';
import { ProducerService } from '@core/kafka/producer.service';
import { ConsumerService } from '@core/kafka/consumer.service';

@Module({
	providers: [ProducerService, ConsumerService],
	exports: [ProducerService, ConsumerService],
})
export class KafkaModule {}
