import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { TrackingDto } from '../dto/request';
import { TrackingUseCase } from '../use-case/tracking.use-case';

@Controller()
export class TrackingController {
	constructor(private readonly trackingUseCase: TrackingUseCase) {}

	@Get('tracking')
	@Redirect()
	async trackingProducer(@Query() query: TrackingDto) {
		const url = await this.trackingUseCase.execute(query);
		return { url, statudCode: 302 };
	}
}
