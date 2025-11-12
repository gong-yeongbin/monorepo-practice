import { Injectable, OnApplicationShutdown, Scope } from '@nestjs/common';
import { Consumer, EachBatchPayload, EachMessagePayload, Kafka } from 'kafkajs';
import { IConsumer } from '@core/kafka/interface';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class ConsumerRepository implements IConsumer, OnApplicationShutdown {
	private kafka: Kafka;
	private consumer: Consumer;

	constructor(private readonly configService: ConfigService) {
		this.kafka = new Kafka({
			brokers: [this.configService.get<string>('KAFKA_HOST') || 'localhost:9092'],
		});
	}

	async init(groupId: string) {
		this.consumer = this.kafka.consumer({
			groupId,
			minBytes: 10000,
			maxBytes: 1000000,
			maxBytesPerPartition: 1000000,
		});
		await this.consumer.connect();
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
