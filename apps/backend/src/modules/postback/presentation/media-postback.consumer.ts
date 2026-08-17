// media-postback 스트림 메시지를 수신해 use-case로 전달하는 Redis Stream consumer 어댑터
import { Injectable, OnModuleInit } from '@nestjs/common';
import { StreamConsumer } from '@infra/stream/stream-consumer.service';
import { SendMediaPostbackUseCase } from '@postback/application/send-media-postback.use-case';
import { MEDIA_POSTBACK_STREAM } from '@postback/domain/media-postback';

@Injectable()
export class MediaPostbackConsumer implements OnModuleInit {
	constructor(
		private readonly sendMediaPostbackUseCase: SendMediaPostbackUseCase,
		private readonly consumer: StreamConsumer
	) {}

	onModuleInit() {
		this.consumer.register(MEDIA_POSTBACK_STREAM, (messages) => this.sendMediaPostbackUseCase.execute(messages));
	}
}
