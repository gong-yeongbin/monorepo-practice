import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Consumer, EachBatchPayload, EachMessagePayload, Kafka } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnApplicationShutdown {
	private readonly kafka: Kafka = new Kafka({
		brokers: ['localhost:9092'],
	});
	private readonly consumer: Consumer = this.kafka.consumer({ groupId: 'mecross-system-group' });
	private isConnected: boolean = false;

	async onModuleInit() {
		if (!this.isConnected) {
			await this.consumer.connect();
		}
		this.isConnected = true;
	}

	async each(topic: string, eachMessage: (params: EachMessagePayload) => Promise<void>) {
		await this.consumer.subscribe({ topic: topic, fromBeginning: false });
		await this.consumer.run({
			eachMessage,
		});
	}

	async batch(topic: string, eachBatch: (params: EachBatchPayload) => Promise<void>) {
		await this.consumer.subscribe({ topic: topic, fromBeginning: false });
		await this.consumer.run({
			eachBatch,
		});
	}

	async onApplicationShutdown() {
		await this.consumer.disconnect();
	}
}
