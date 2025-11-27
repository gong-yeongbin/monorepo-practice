import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetAdvertisingDashboardDto } from '@dashboard/dto/request';
import { GetDashboardAdvertisingUseCase } from '@dashboard/use-case';
import { CookieAuthGuard } from '@common/guard';

@UseGuards(CookieAuthGuard)
@Controller('dashboard')
export class DashboardController {
	constructor(private readonly getDashboardAdvertisingUseCase: GetDashboardAdvertisingUseCase) {}

	@Get()
	async dashboard(@Query() query: GetAdvertisingDashboardDto) {
		return await this.getDashboardAdvertisingUseCase.execute(query.baseDate);
	}
}
