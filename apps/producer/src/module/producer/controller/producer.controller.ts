import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { TrackingDto } from '../dto/request';
import { TrackingProducerUseCase } from '../use-case';

@Controller()
export class ProducerController {
	constructor(private readonly trackingProducerUseCase: TrackingProducerUseCase) {}

	@Get('tracking')
	@Redirect()
	async trackingProducer(@Query() query: TrackingDto) {
		const url = await this.trackingProducerUseCase.producer(query);
		return { url, statudCode: 302 };
	}
}
