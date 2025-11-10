import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService } from '@core/kafka/kafka-consumer.service';
import { plainToInstance } from 'class-transformer';
import { PostbackDto } from '@postback/dto';
import { POSTBACK_REPOSITORY } from '@postback/domain/symbol';
import { IPostback } from '@postback/domain/repositories';

@Injectable()
export class PostbackConsumeUseCase implements OnModuleInit {
	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepositroy: IPostback,
		private readonly consumerService: KafkaConsumerService
	) {}

	async onModuleInit() {
		await this.consumerService.each('postback', async ({ message }) => {
			if (message.value?.toString()) {
				const postback = plainToInstance(PostbackDto, JSON.parse(message.value?.toString()), { ignoreDecorators: true, enableImplicitConversion: true });
				await this.postbackRepositroy.create(postback);
			}
		});
		// await this.consumerService.batch('postback', async ({ batch }) => {
		// 	for (const message of batch.messages) {
		// 		if (message.value?.toString()) {
		// 			console.log(JSON.parse(message.value?.toString()));
		// 		}
		// 	}
		// });
	}
}
