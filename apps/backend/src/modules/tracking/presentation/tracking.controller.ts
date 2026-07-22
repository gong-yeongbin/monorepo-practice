import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryDto } from '@tracking/application/dto/query.dto';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';

@ApiTags('tracking')
@Controller()
export class TrackingController {
	constructor(private readonly trackingUseCase: TrackingUseCase) {}

	@Get('tracking')
	@Redirect()
	@ApiOperation({ summary: '트래킹 클릭 — 트래커 URL로 302 리다이렉트' })
	@ApiResponse({ status: 302, description: '트래커 트래킹 URL로 리다이렉트' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'token에 해당하는 campaign 또는 tracker 없음' })
	async tracking(@Query() query: QueryDto) {
		return { url: await this.trackingUseCase.execute(query) };
	}
}
