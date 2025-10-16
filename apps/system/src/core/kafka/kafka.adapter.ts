import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';

@Injectable()
export class KafkaAdapter implements OnModuleInit, OnModuleDestroy, KafkaService {
	constructor(@Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka) {}

	async onModuleDestroy(): Promise<void> {
		await this.kafkaClient.connect();
	}

	async onModuleInit() {
		await this.kafkaClient.close();
	}
}
