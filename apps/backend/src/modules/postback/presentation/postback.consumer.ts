// postback 스트림 메시지를 수신해 use-case로 전달하는 Redis Stream consumer 어댑터
import { Injectable, OnModuleInit } from '@nestjs/common';
import { StreamConsumer } from '@infra/stream/stream-consumer.service';
import { PostbackConsumerUseCase } from '@postback/application/postback-consumer.use-case';

@Injectable()
export class PostbackConsumer implements OnModuleInit {
	constructor(
		private readonly postbackConsumerUseCase: PostbackConsumerUseCase,
		private readonly consumer: StreamConsumer
	) {}

	onModuleInit() {
		this.consumer.register('postback', (messages) => this.postbackConsumerUseCase.execute(messages));
	}
}
