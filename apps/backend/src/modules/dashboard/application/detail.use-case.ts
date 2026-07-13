// advertising별 매체·캠페인 단위 상세 통계를 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { DetailRow } from '@dashboard/domain/statistics.entity';
import { DASHBOARD_REPOSITORY, DashboardRepository } from '@dashboard/domain/dashboard.repository';
import { DetailDto } from '@dashboard/application/dto/statistics.dto';

@Injectable()
export class DetailUseCase {
	constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: DashboardRepository) {}

	async execute(advertising_id: number, dto: DetailDto): Promise<DetailRow[]> {
		return this.dashboardRepository.detail(advertising_id, { start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) }, dto.media_id);
	}
}
