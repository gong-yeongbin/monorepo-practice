// tracking 스트림 메시지를 수신해 use-case로 전달하는 Redis Stream consumer 어댑터
import { Injectable, OnModuleInit } from '@nestjs/common';
import { StreamConsumer } from '@infra/stream/stream-consumer.service';
import { TrackingConsumerUseCase } from '@tracking/application/tracking-consumer.use-case';

@Injectable()
export class TrackingConsumer implements OnModuleInit {
	constructor(
		private readonly trackingConsumerUseCase: TrackingConsumerUseCase,
		private readonly consumer: StreamConsumer
	) {}

	onModuleInit() {
		this.consumer.register('tracking', (viewCodes) => this.trackingConsumerUseCase.execute(viewCodes));
	}
}
