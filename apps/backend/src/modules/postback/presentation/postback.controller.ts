import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TRACKER_NAMES } from '@trackers/tracker.registry';
import { Tracker } from '@postback/presentation/dto/tracker.dto';
import { InstallPostbackUseCase } from '@postback/application/install-postback.use-case';
import { EventPostbackUseCase } from '@postback/application/event-postback.use-case';
import { Public } from '@auth/presentation/public.decorator';

@ApiTags('postback')
// 트래커가 직접 호출하는 공개 엔드포인트 — 인증 대신 IP 기준 rate limit으로 보호한다
@Public()
@UseGuards(ThrottlerGuard)
@Controller()
export class PostbackController {
	constructor(
		private readonly installPostbackUseCase: InstallPostbackUseCase,
		private readonly eventPostbackUseCase: EventPostbackUseCase
	) {}

	@Get(':name/install')
	@ApiOperation({ summary: '트래커 install 포스트백 수신 (쿼리 키는 트래커별로 다름)' })
	@ApiParam({ name: 'name', enum: TRACKER_NAMES })
	@ApiResponse({ status: 200, description: '수신 성공 — 스트림에 적재 후 비동기 처리' })
	@ApiResponse({ status: 400, description: '지원하지 않는 트래커 이름' })
	@ApiResponse({ status: 429, description: 'IP 기준 요청 한도 초과' })
	async install(@Param() tracker: Tracker, @Query() query: Record<string, string>) {
		return await this.installPostbackUseCase.execute(tracker.name, query);
	}

	@Get(':name/event')
	@ApiOperation({ summary: '트래커 event 포스트백 수신 (쿼리 키는 트래커별로 다름)' })
	@ApiParam({ name: 'name', enum: TRACKER_NAMES })
	@ApiResponse({ status: 200, description: '수신 성공 — 스트림에 적재 후 비동기 처리' })
	@ApiResponse({ status: 400, description: '지원하지 않는 트래커 이름' })
	@ApiResponse({ status: 429, description: 'IP 기준 요청 한도 초과' })
	async event(@Param() tracker: Tracker, @Query() query: Record<string, string>) {
		return await this.eventPostbackUseCase.execute(tracker.name, query);
	}
}
