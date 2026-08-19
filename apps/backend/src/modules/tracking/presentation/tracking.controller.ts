import { Controller, Get, Query, Redirect, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { QueryDto } from '@tracking/application/dto/query.dto';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';

@ApiTags('tracking')
@UseGuards(ThrottlerGuard)
@SkipThrottle({ postback: true })
@Controller()
export class TrackingController {
	constructor(private readonly trackingUseCase: TrackingUseCase) {}

	@Get('tracking')
	@Redirect()
	@ApiOperation({ summary: '트래킹 클릭 — 트래커 URL로 302 리다이렉트' })
	@ApiResponse({ status: 302, description: '트래커 트래킹 URL로 리다이렉트' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'token에 해당하는 campaign 또는 tracker 없음(비활성 campaign 포함)' })
	@ApiResponse({ status: 429, description: 'IP 기준 요청 한도 초과' })
	async tracking(@Query() query: QueryDto) {
		return { url: await this.trackingUseCase.execute(query) };
	}
}
