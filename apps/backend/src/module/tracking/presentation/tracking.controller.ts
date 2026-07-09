import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { QueryDto } from '@tracking/application/dto/query.dto';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';

@Controller()
export class TrackingController {
	constructor(private readonly trackingUseCase: TrackingUseCase) {}

	@Get('tracking')
	@Redirect()
	async tracking(@Query() query: QueryDto) {
		return { url: await this.trackingUseCase.execute(query) };
	}
}
