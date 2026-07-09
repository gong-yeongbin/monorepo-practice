import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { BatchHandler, ConsumerPort } from '@core/kafka/consumer.port';

@Injectable()
export class KafkaConsumerAdapter implements ConsumerPort, OnApplicationBootstrap, OnApplicationShutdown {
	private readonly kafka: Kafka;
	private consumer: Consumer;
	private readonly handlers = new Map<string, BatchHandler>();

	constructor(private readonly configService: ConfigService) {
		this.kafka = new Kafka({
			brokers: [this.configService.get<string>('KAFKA_HOST') || 'localhost:9092'],
		});
	}

	// OnApplicationBootstrap에서 구독을 시작하므로 등록은 OnModuleInit 시점까지 완료되어야 한다
	register(topic: string, handler: BatchHandler) {
		this.handlers.set(topic, handler);
	}

	async onApplicationBootstrap() {
		this.consumer = this.kafka.consumer({
			groupId: this.configService.get<string>('KAFKA_GROUP_ID') || 'mecross-system',
			allowAutoTopicCreation: true,
			minBytes: 10000,
			maxBytes: 1000000,
			maxBytesPerPartition: 1000000,
		});
		await this.consumer.connect();

		for (const topic of this.handlers.keys()) {
			await this.consumer.subscribe({ topic, fromBeginning: false });
		}

		await this.consumer.run({
			eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
				const handler = this.handlers.get(batch.topic);
				if (!handler) return;

				// 처리 불가능한 메시지로 인한 무한 재소비(poison pill)를 막기 위해 offset은 여기서 모두 resolve한다
				const messages: string[] = [];
				for (const message of batch.messages) {
					const value = message.value?.toString();
					if (value) messages.push(value);
					resolveOffset(message.offset);
					await heartbeat();
				}

				await handler(messages);
			},
		});
	}

	async onApplicationShutdown() {
		await this.consumer.disconnect();
	}
}
