import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnApplicationShutdown {
	private readonly kafka: Kafka = new Kafka({
		brokers: ['localhost:9092'],
		clientId: 'mecross-system',
	});
	private producer: Producer = this.kafka.producer();

	async onModuleInit() {
		await this.producer.connect();
	}

	async each(topic: string, message: string) {
		await this.producer.send({ topic, messages: [{ value: message }] });
	}

	async batch(topic: string, messages: string[]) {
		await this.producer.sendBatch({
			topicMessages: [
				{
					topic,
					messages: messages.map((message) => {
						return { value: message };
					}),
				},
			],
		});
	}

	async onApplicationShutdown() {
		await this.producer.disconnect();
	}
}
