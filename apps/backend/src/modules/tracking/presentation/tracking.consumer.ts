// tracking 토픽 메시지를 수신해 use-case로 전달하는 Kafka consumer 어댑터
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CONSUMER_PORT, ConsumerPort } from '@infra/messaging/consumer.port';
import { TrackingConsumerUseCase } from '@tracking/application/tracking-consumer.use-case';

@Injectable()
export class TrackingConsumer implements OnModuleInit {
	constructor(
		private readonly trackingConsumerUseCase: TrackingConsumerUseCase,
		@Inject(CONSUMER_PORT) private readonly consumer: ConsumerPort
	) {}

	onModuleInit() {
		this.consumer.register('tracking', (viewCodes) => this.trackingConsumerUseCase.execute(viewCodes));
	}
}
