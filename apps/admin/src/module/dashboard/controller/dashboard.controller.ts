import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardAdvertisingUseCase, DashboardCampaignUseCase, DashboardMediaDetailUseCase, DashboardMediaUseCase } from '@dashboard/use-case';
import { CookieAuthGuard } from '@common/guard';
import { BaseDateDto, DateRangeDto } from '@dashboard/dto/request/query';
import { AdvertisingNameDto, CampaignTokenDto } from '@dashboard/dto/request/param';

@UseGuards(CookieAuthGuard)
@Controller('dashboard')
export class DashboardController {
	constructor(
		private readonly dashboardAdvertisingUseCase: DashboardAdvertisingUseCase,
		private readonly dashboardCampaignUseCase: DashboardCampaignUseCase,
		private readonly dashboardMediaUseCase: DashboardMediaUseCase,
		private readonly dashboardMediaDetailUseCase: DashboardMediaDetailUseCase
	) {}

	@Get('advertising')
	async dashboard(@Query() query: BaseDateDto) {
		return await this.dashboardAdvertisingUseCase.execute(query.baseDate);
	}

	@Get('advertising/:name')
	async advertising(@Param() param: AdvertisingNameDto, @Query() query: DateRangeDto) {
		return await this.dashboardCampaignUseCase.execute(param.name, query.startDate, query.endDate);
	}

	@Get('campaign/:token')
	async campaign(@Param() param: CampaignTokenDto, @Query() query: DateRangeDto) {
		return await this.dashboardMediaUseCase.execute(param.token, query.startDate, query.endDate);
	}

	@Get('campaign/:token/detail')
	async campaignDetail(@Param() param: CampaignTokenDto, @Query() query: DateRangeDto) {
		return await this.dashboardMediaDetailUseCase.execute(param.token, query.startDate, query.endDate);
	}
}
