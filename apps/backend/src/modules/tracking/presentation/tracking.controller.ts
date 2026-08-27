import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { QueryDto } from '@tracking/application/dto/query.dto';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';
import { Public } from '@auth/presentation/public.decorator';

@ApiTags('tracking')
// 광고 클릭이 직접 호출하는 공개 엔드포인트 — 인증 대신 IP 기준 rate limit으로 보호한다
@Public()
@UseGuards(ThrottlerGuard)
@SkipThrottle({ postback: true })
@Controller()
export class TrackingController {
	constructor(private readonly trackingUseCase: TrackingUseCase) {}

	@Get('tracking')
	@ApiOperation({ summary: '트래킹 클릭 — 트래커 URL로 302 리다이렉트' })
	@ApiResponse({ status: 302, description: '트래커 트래킹 URL로 리다이렉트' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: 'token에 해당하는 campaign 또는 tracker 없음' })
	async tracking(@Query() query: QueryDto, @Res() res: Response) {
		const url = await this.trackingUseCase.execute(query);
		// res.redirect()는 HTML 바디("Found. Redirecting to...")를 붙인다.
		// 클릭량에 곱해지는 전송 바이트라 바디 없이 헤더만 보낸다.
		res.writeHead(302, { Location: url });
		res.end();
	}
}
