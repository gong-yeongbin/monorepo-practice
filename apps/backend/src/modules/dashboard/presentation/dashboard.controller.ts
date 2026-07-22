// daily_report 집계 통계(대시보드) 조회를 처리하는 컨트롤러
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardUseCase } from '@dashboard/application/dashboard.use-case';
import { DailyUseCase } from '@dashboard/application/daily.use-case';
import { DetailUseCase } from '@dashboard/application/detail.use-case';
import { DashboardDto, DailyDto, DetailDto } from '@dashboard/application/dto/statistics.dto';
import { AdvertisingIdDto } from '@dashboard/application/dto/advertising-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@ApiTags('dashboard')
@Controller('dashboard')
@UseInterceptors(ResponseInterceptor)
export class DashboardController {
	constructor(
		private readonly dashboardUseCase: DashboardUseCase,
		private readonly dailyUseCase: DailyUseCase,
		private readonly detailUseCase: DetailUseCase
	) {}

	@Get()
	@ApiOperation({ summary: '대시보드 — 특정 일자 집계' })
	async dashboard(@Query() query: DashboardDto) {
		return this.dashboardUseCase.execute(query);
	}

	@Get('daily')
	@ApiOperation({ summary: '일별 통계 — 날짜 범위 (token 생략 시 전체 합산)' })
	async daily(@Query() query: DailyDto) {
		return this.dailyUseCase.execute(query);
	}

	@Get('detail/:id')
	@ApiOperation({ summary: '상세 통계 — advertising 단위 (media_id 필터 선택)' })
	async detail(@Param() param: AdvertisingIdDto, @Query() query: DetailDto) {
		return this.detailUseCase.execute(param.id, query);
	}
}
