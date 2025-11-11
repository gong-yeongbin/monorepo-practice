import { Controller, Get, Inject, OnModuleDestroy, OnModuleInit, Param, Query, UseInterceptors } from '@nestjs/common';
import { Tracker } from '@postback/dto';
import { EventPostbackUseCase, InstallPostbackUseCase, PostbackConsumerUseCase } from '@postback/use-case';
import { PostbackProducerInterceptor } from '@postback/interceptor';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class PostbackController implements OnModuleInit, OnModuleDestroy {
	constructor(
		@Inject('KAFKA_SERVICE') private readonly client: ClientKafka,
		private readonly installPostbackUseCase: InstallPostbackUseCase,
		private readonly eventPostbackUseCase: EventPostbackUseCase,
		private readonly postbackConsumeUseCase: PostbackConsumerUseCase
	) {}

	async onModuleInit() {
		this.client.subscribeToResponseOf('postback');
		await this.client.connect();
	}

	async onModuleDestroy(): Promise<void> {
		await this.client.close();
	}

	@Get(':name/install')
	@UseInterceptors(PostbackProducerInterceptor)
	async install(@Param() tracker: Tracker, @Query() query: any) {
		return await this.installPostbackUseCase.execute(tracker.name, query);
	}

	@Get(':name/event')
	@UseInterceptors(PostbackProducerInterceptor)
	async event(@Param() tracker: Tracker, @Query() query: any) {
		return await this.eventPostbackUseCase.execute(tracker.name, query);
	}

	@EventPattern('postback')
	async consume(@Payload() message: string) {
		await this.postbackConsumeUseCase.execute(message);
	}
}
