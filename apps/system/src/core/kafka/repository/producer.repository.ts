import { Injectable, OnApplicationShutdown, OnModuleInit, Scope } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { IProducer } from '@core/kafka/interface';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class ProducerRepository implements IProducer, OnApplicationShutdown {
	private readonly kafka: Kafka;
	private readonly producer: Producer;

	constructor(private readonly configService: ConfigService) {
		this.kafka = new Kafka({
			brokers: [this.configService.get<string>('KAFKA_HOST') || 'localhost:9092'],
			clientId: this.configService.get<string>('KAFKA_CLIENT_ID'),
		});
		this.producer = this.kafka.producer({ allowAutoTopicCreation: true, retry: { retries: 0 } });
	}

	async each(topic: string, message: string) {
		await this.producer.connect();
		await this.producer.send({ topic, messages: [{ value: message }], acks: 0 });
	}

	async batch(topic: string, messages: string[]) {
		await this.producer.connect();
		await this.producer.sendBatch({
			topicMessages: [
				{
					topic,
					messages: messages.map((message) => ({ value: message })),
				},
			],
		});
	}

	async onApplicationShutdown() {
		await this.producer.disconnect();
	}
}
