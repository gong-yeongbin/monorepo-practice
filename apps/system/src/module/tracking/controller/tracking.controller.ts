import { Body, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { BodyDto, QueryDto } from '@tracking/dto/request';
import { TrackingUseCase } from '@tracking/use-case';
import { TrackingCacheInterceptor, TrackingProducerInterceptor } from '@tracking/interceptor';

@Controller()
export class TrackingController {
	constructor(private readonly trackingUseCase: TrackingUseCase) {}

	@Get('tracking')
	@UseInterceptors(TrackingCacheInterceptor)
	@UseInterceptors(TrackingProducerInterceptor)
	async tracking(@Query() query: QueryDto, @Body() body: BodyDto) {
		return await this.trackingUseCase.execute(query, body);
	}
}
