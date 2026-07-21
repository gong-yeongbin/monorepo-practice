// 일별 통계를 조회하는 use-case(token이 있으면 캠페인 한정, 없으면 전체 합산)
import { Inject, Injectable } from '@nestjs/common';
import { DailyRow } from '@dashboard/domain/statistics.entity';
import { DASHBOARD_REPOSITORY, DashboardRepository } from '@dashboard/domain/dashboard.repository';
import { DailyDto } from '@dashboard/application/dto/statistics.dto';

@Injectable()
export class DailyUseCase {
	constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: DashboardRepository) {}

	async execute(dto: DailyDto): Promise<DailyRow[]> {
		return this.dashboardRepository.daily({ start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) }, dto.token);
	}
}
