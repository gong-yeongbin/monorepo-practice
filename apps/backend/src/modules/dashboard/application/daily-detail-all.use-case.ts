// 날짜 범위 전체 일별 통계를 조회하는 use-case(admin excel 엔드포인트 = 필터 없는 조회)
import { Inject, Injectable } from '@nestjs/common';
import { DailyRow } from '@dashboard/domain/statistics.entity';
import { DASHBOARD_REPOSITORY, DashboardRepository } from '@dashboard/domain/dashboard.repository';
import { DailyDetailAllDto } from '@dashboard/application/dto/statistics.dto';

@Injectable()
export class DailyDetailAllUseCase {
	constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: DashboardRepository) {}

	async execute(dto: DailyDetailAllDto): Promise<DailyRow[]> {
		return this.dashboardRepository.dailyDetailAll({ start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) });
	}
}
