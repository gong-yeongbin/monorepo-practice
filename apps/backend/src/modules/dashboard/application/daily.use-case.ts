// token 기준 일별 통계를 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { DailyRow } from '@dashboard/domain/statistics.entity';
import { DASHBOARD_REPOSITORY, DashboardRepository } from '@dashboard/domain/dashboard.repository';
import { DailyDto } from '@dashboard/application/dto/statistics.dto';

@Injectable()
export class DailyUseCase {
	constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: DashboardRepository) {}

	async execute(dto: DailyDto): Promise<DailyRow[]> {
		return this.dashboardRepository.daily(dto.token, { start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) });
	}
}
