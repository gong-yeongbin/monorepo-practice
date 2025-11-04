import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { TrackingDto } from '@tracking/dto/request';
import { TrackingUseCase } from '@tracking/use-case';

@Controller()
export class TrackingController {
	constructor(private readonly trackingUseCase: TrackingUseCase) {}

	@Get('tracking')
	@Redirect()
	async tracking(@Query() query: TrackingDto) {
		const redirectUrl = await this.trackingUseCase.execute(query);
		return { url: redirectUrl, statudCode: 302 };
	}
}
