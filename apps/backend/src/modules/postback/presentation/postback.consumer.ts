// postback 토픽 메시지를 수신해 use-case로 전달하는 Kafka consumer 어댑터
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CONSUMER_PORT, ConsumerPort } from '@infra/messaging/consumer.port';
import { PostbackConsumerUseCase } from '@postback/application/postback-consumer.use-case';

@Injectable()
export class PostbackConsumer implements OnModuleInit {
	constructor(
		private readonly postbackConsumerUseCase: PostbackConsumerUseCase,
		@Inject(CONSUMER_PORT) private readonly consumer: ConsumerPort
	) {}

	onModuleInit() {
		this.consumer.register('postback', (messages) => this.postbackConsumerUseCase.execute(messages));
	}
}
