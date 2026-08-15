// 어드민 포스트백 로그 조회(인스톨·이벤트·미등록 모달)를 처리하는 컨트롤러.
// 루트의 PostbackController(트래커 수신용 공개 URL)와 달리 어드민 API라 ResponseInterceptor를 적용한다.
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListInstallPostbacksUseCase } from '@postback/application/list-install-postbacks.use-case';
import { ListEventPostbacksUseCase } from '@postback/application/list-event-postbacks.use-case';
import { ListUnregisteredPostbacksUseCase } from '@postback/application/list-unregistered-postbacks.use-case';
import { EventLogDto, InstallLogDto, UnregisteredLogDto } from '@postback/application/dto/postback-log.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { PostbackLogResponse, UnregisteredCountResponse } from '@postback/presentation/dto/postback-log.response.dto';

@ApiTags('postbacks')
@Controller('postbacks')
@UseInterceptors(ResponseInterceptor)
export class PostbackLogController {
	constructor(
		private readonly listInstallPostbacksUseCase: ListInstallPostbacksUseCase,
		private readonly listEventPostbacksUseCase: ListEventPostbacksUseCase,
		private readonly listUnregisteredPostbacksUseCase: ListUnregisteredPostbacksUseCase
	) {}

	@Get('install')
	@ApiOperation({ summary: 'install 포스트백 로그 — token 또는 view_code 기준' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: PostbackLogResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async install(@Query() query: InstallLogDto) {
		return this.listInstallPostbacksUseCase.execute(query);
	}

	@Get('event')
	@ApiOperation({ summary: 'event 포스트백 로그 — admin 이벤트명을 campaign_config로 변환해 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: PostbackLogResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async event(@Query() query: EventLogDto) {
		return this.listEventPostbacksUseCase.execute(query);
	}

	@Get('unregistered')
	@ApiOperation({ summary: '미등록 이벤트 카운트 — campaign_config에 없는 이벤트명 그룹 합계' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: UnregisteredCountResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async unregistered(@Query() query: UnregisteredLogDto) {
		return this.listUnregisteredPostbacksUseCase.execute(query);
	}
}
