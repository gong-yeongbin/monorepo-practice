// 특정 일자의 advertising별 통계를 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { DashboardRow } from '@dashboard/domain/statistics.entity';
import { DASHBOARD_REPOSITORY, DashboardRepository } from '@dashboard/domain/dashboard.repository';
import { DashboardDto } from '@dashboard/application/dto/statistics.dto';

@Injectable()
export class DashboardUseCase {
	constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: DashboardRepository) {}

	async execute(dto: DashboardDto): Promise<DashboardRow[]> {
		return this.dashboardRepository.dashboard(new Date(dto.date));
	}
}
