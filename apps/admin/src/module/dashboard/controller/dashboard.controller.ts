import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GetStatisticByAdvertisingDto, GetStatisticByCampaignDto } from '@dashboard/dto/request';
import { GetStatisticByAdvertisingUseCase, GetStatisticByCampaignUseCase } from '@dashboard/use-case';
import { CookieAuthGuard } from '@common/guard';
import { AdvertisingNameDto } from '@dashboard/dto/advertising-name.dto';

@UseGuards(CookieAuthGuard)
@Controller('dashboard')
export class DashboardController {
	constructor(
		private readonly getStatisticByAdvertisingUseCase: GetStatisticByAdvertisingUseCase,
		private readonly getStatisticByCampaignUseCase: GetStatisticByCampaignUseCase
	) {}

	@Get('advertising')
	async statisticByAdvertising(@Query() query: GetStatisticByAdvertisingDto) {
		console.log(query);
		return await this.getStatisticByAdvertisingUseCase.execute(query.baseDate);
	}

	@Get('advertising/:name/campaign')
	async statisticByCampaign(@Param() param: AdvertisingNameDto, @Query() query: GetStatisticByCampaignDto) {
		return await this.getStatisticByCampaignUseCase.execute(param.name, query.startDate, query.endDate);
	}
}
