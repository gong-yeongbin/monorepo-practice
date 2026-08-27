// 일자별 상세 통계를 조회하는 use-case(캠페인 token 기준, view_code·pub_id·sub_id 단위)
import { Inject, Injectable } from '@nestjs/common';
import { DailyDetailRow } from '@dashboard/domain/statistics.entity';
import { DASHBOARD_REPOSITORY, DashboardRepository } from '@dashboard/domain/dashboard.repository';
import { DailyDetailDto } from '@dashboard/application/dto/statistics.dto';
import { AdvertisingScope } from '@auth/application/advertising-scope';

@Injectable()
export class DailyDetailUseCase {
	constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: DashboardRepository) {}

	async execute(dto: DailyDetailDto, scope: AdvertisingScope): Promise<DailyDetailRow[]> {
		return this.dashboardRepository.dailyDetail(
			{ start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) },
			dto.token,
			{ field: dto.type, order: dto.order },
			scope
		);
	}
}
