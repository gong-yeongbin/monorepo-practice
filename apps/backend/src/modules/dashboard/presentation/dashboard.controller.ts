// daily_report 집계 통계(대시보드) 조회를 처리하는 컨트롤러
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { DashboardUseCase } from '@dashboard/application/dashboard.use-case';
import { DailyUseCase } from '@dashboard/application/daily.use-case';
import { DetailUseCase } from '@dashboard/application/detail.use-case';
import { DashboardDto, DailyDto, DetailDto } from '@dashboard/application/dto/statistics.dto';
import { AdvertisingIdDto } from '@dashboard/application/dto/advertising-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('dashboard')
@UseInterceptors(ResponseInterceptor)
export class DashboardController {
	constructor(
		private readonly dashboardUseCase: DashboardUseCase,
		private readonly dailyUseCase: DailyUseCase,
		private readonly detailUseCase: DetailUseCase
	) {}

	@Get()
	async dashboard(@Query() query: DashboardDto) {
		return this.dashboardUseCase.execute(query);
	}

	@Get('daily')
	async daily(@Query() query: DailyDto) {
		return this.dailyUseCase.execute(query);
	}

	@Get('detail/:id')
	async detail(@Param() param: AdvertisingIdDto, @Query() query: DetailDto) {
		return this.detailUseCase.execute(param.id, query);
	}
}
