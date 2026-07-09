import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { ProducerPort } from '@core/kafka/producer.port';

@Injectable()
export class KafkaProducerAdapter implements ProducerPort, OnModuleInit, OnApplicationShutdown {
	private readonly producer: Producer;

	constructor(configService: ConfigService) {
		const kafka = new Kafka({
			brokers: [configService.get<string>('KAFKA_HOST') || 'localhost:9092'],
			clientId: configService.get<string>('KAFKA_CLIENT_ID'),
			retry: {
				initialRetryTime: 3000,
				retries: 10,
			},
		});
		this.producer = kafka.producer({ allowAutoTopicCreation: true });
	}

	async onModuleInit() {
		await this.producer.connect();
	}

	async send(topic: string, message: string) {
		await this.producer.send({ topic, messages: [{ value: message }] });
	}

	async onApplicationShutdown() {
		await this.producer.disconnect();
	}
}
