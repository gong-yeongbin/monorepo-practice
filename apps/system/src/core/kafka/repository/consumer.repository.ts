import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Consumer, EachBatchPayload, EachMessagePayload, Kafka } from 'kafkajs';
import { IConsumer } from '@core/kafka/interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConsumerRepository implements IConsumer, OnApplicationShutdown {
	private readonly kafka: Kafka;
	private readonly consumer: Consumer;

	constructor(private readonly configService: ConfigService) {
		this.kafka = new Kafka({
			brokers: [this.configService.get<string>('KAFKA_HOST') || 'localhost:9092'],
		});
		this.consumer = this.kafka.consumer({ groupId: 'mecross-system-consumer' });
	}

	async each(topic: string, eachMessage: (params: EachMessagePayload) => Promise<void>) {
		await this.consumer.connect();
		await this.consumer.subscribe({ topic: topic, fromBeginning: false });
		await this.consumer.run({
			eachMessage,
		});
	}

	async batch(topic: string, eachBatch: (params: EachBatchPayload) => Promise<void>) {
		await this.consumer.connect();
		await this.consumer.subscribe({ topic: topic, fromBeginning: false });
		await this.consumer.run({
			eachBatch,
		});
	}

	async onApplicationShutdown() {
		await this.consumer.disconnect();
	}
}
