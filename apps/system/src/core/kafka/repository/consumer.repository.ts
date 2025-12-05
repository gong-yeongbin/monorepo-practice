import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Consumer, EachBatchPayload, Kafka } from 'kafkajs';
import { IConsumer } from '@core/kafka/interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConsumerRepository implements IConsumer, OnApplicationBootstrap, OnApplicationShutdown {
	private kafka: Kafka;
	private consumer: Consumer;
	private readonly batchHandler = new Map<string, (p: EachBatchPayload) => Promise<void>>();

	constructor(private readonly configService: ConfigService) {
		this.kafka = new Kafka({
			brokers: [this.configService.get<string>('KAFKA_HOST') || 'localhost:9092'],
		});
	}

	async registerBatch(topic: string, handler: (p: EachBatchPayload) => Promise<void>) {
		this.batchHandler.set(topic, handler);
	}

	async onApplicationBootstrap() {
		this.consumer = this.kafka.consumer({
			groupId: 'mecross-system',
			allowAutoTopicCreation: true,
			minBytes: 10000,
			maxBytes: 1000000,
			maxBytesPerPartition: 1000000,
		});
		await this.consumer.connect();

		for (const topic of this.batchHandler.keys()) {
			await this.consumer.subscribe({ topic, fromBeginning: false });
		}

		await this.consumer.run({
			eachBatch: async (payload) => {
				const batchHandler = this.batchHandler.get(payload.batch.topic);
				if (batchHandler) await batchHandler(payload);
			},
		});
	}

	async onApplicationShutdown() {
		await this.consumer.disconnect();
	}
}
