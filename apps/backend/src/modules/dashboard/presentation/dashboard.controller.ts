// daily_report 집계 통계(대시보드) 조회를 처리하는 컨트롤러
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardUseCase } from '@dashboard/application/dashboard.use-case';
import { DailyUseCase } from '@dashboard/application/daily.use-case';
import { DailyDetailUseCase } from '@dashboard/application/daily-detail.use-case';
import { DetailUseCase } from '@dashboard/application/detail.use-case';
import { DashboardDto, DailyDetailDto, DailyDto, DetailDto } from '@dashboard/application/dto/statistics.dto';
import { AdvertisingIdDto } from '@dashboard/application/dto/advertising-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { DailyDetailRowResponse, DailyRowResponse, DashboardRowResponse, DetailRowResponse } from '@dashboard/presentation/dto/dashboard.response.dto';
import { Roles } from '@auth/presentation/roles.decorator';
import { CurrentUser } from '@auth/presentation/current-user.decorator';
import { AccessTokenPayload } from '@auth/application/token.constants';
import { advertisingScopeOf } from '@auth/application/advertising-scope';

@ApiTags('dashboard')
// USER에게 열린 유일한 API — 4개 라우트가 전부 조회(@Get)라 클래스 단위로 허용한다.
// USER는 허용 광고 목록(user_advertising) 안의 데이터만 본다. DEVELOPER·ADMIN은 스코핑 면제다.
@Roles('DEVELOPER', 'ADMIN', 'USER')
@Controller('dashboard')
@UseInterceptors(ResponseInterceptor)
export class DashboardController {
	constructor(
		private readonly dashboardUseCase: DashboardUseCase,
		private readonly dailyUseCase: DailyUseCase,
		private readonly dailyDetailUseCase: DailyDetailUseCase,
		private readonly detailUseCase: DetailUseCase
	) {}

	@Get()
	@ApiOperation({ summary: '대시보드 — 특정 일자 집계' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: DashboardRowResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async dashboard(@Query() query: DashboardDto, @CurrentUser() user: AccessTokenPayload) {
		return this.dashboardUseCase.execute(query, advertisingScopeOf(user));
	}

	@Get('daily')
	@ApiOperation({ summary: '일별 통계 — 날짜 범위 (token 생략 시 전체 합산)' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: DailyRowResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async daily(@Query() query: DailyDto, @CurrentUser() user: AccessTokenPayload) {
		return this.dailyUseCase.execute(query, advertisingScopeOf(user));
	}

	@Get('dailydetail')
	@ApiOperation({ summary: '일자별 상세 — campaign token 기준, view_code·pub_id·sub_id 단위 (카운터 정렬)' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: DailyDetailRowResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async dailyDetail(@Query() query: DailyDetailDto, @CurrentUser() user: AccessTokenPayload) {
		return this.dailyDetailUseCase.execute(query, advertisingScopeOf(user));
	}

	@Get('detail/:id')
	@ApiOperation({ summary: '상세 통계 — advertising 단위 (media_id 필터 선택)' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: DetailRowResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async detail(@Param() param: AdvertisingIdDto, @Query() query: DetailDto, @CurrentUser() user: AccessTokenPayload) {
		return this.detailUseCase.execute(param.id, query, advertisingScopeOf(user));
	}
}
