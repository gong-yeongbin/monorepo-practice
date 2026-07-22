import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryDto } from '@tracking/application/dto/query.dto';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';

@ApiTags('tracking')
@Controller()
export class TrackingController {
	constructor(private readonly trackingUseCase: TrackingUseCase) {}

	@Get('tracking')
	@Redirect()
	@ApiOperation({ summary: '트래킹 클릭 — 트래커 URL로 302 리다이렉트' })
	async tracking(@Query() query: QueryDto) {
		return { url: await this.trackingUseCase.execute(query) };
	}
}
