import { Body, Controller, Get, Inject, OnModuleDestroy, OnModuleInit, Query, UseInterceptors } from '@nestjs/common';
import { BodyDto, QueryDto } from '@tracking/dto/request';
import { TrackingConsumerUseCase, TrackingUseCase } from '@tracking/use-case';
import { TrackingCacheInterceptor, TrackingProducerInterceptor } from '@tracking/interceptor';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class TrackingController implements OnModuleInit, OnModuleDestroy {
	constructor(
		@Inject('KAFKA_SERVICE') private readonly client: ClientKafka,
		private readonly trackingUseCase: TrackingUseCase,
		private readonly trackingConsumerUseCase: TrackingConsumerUseCase
	) {}

	async onModuleInit() {
		this.client.subscribeToResponseOf('tracking');
		await this.client.connect();
	}

	async onModuleDestroy(): Promise<void> {
		await this.client.close();
	}

	@Get('tracking')
	@UseInterceptors(TrackingCacheInterceptor)
	@UseInterceptors(TrackingProducerInterceptor)
	async tracking(@Query() query: QueryDto, @Body() body: BodyDto) {
		return await this.trackingUseCase.execute(query, body);
	}

	@EventPattern('tracking')
	async consume(@Payload() message: string) {
		await this.trackingConsumerUseCase.execute(message);
	}
}
