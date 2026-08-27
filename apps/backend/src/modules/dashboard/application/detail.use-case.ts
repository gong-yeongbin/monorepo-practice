// advertising별 매체·캠페인 단위 상세 통계를 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { DetailRow } from '@dashboard/domain/statistics.entity';
import { DASHBOARD_REPOSITORY, DashboardRepository } from '@dashboard/domain/dashboard.repository';
import { DetailDto } from '@dashboard/application/dto/statistics.dto';
import { AdvertisingScope, isAdvertisingAllowed } from '@auth/application/advertising-scope';

@Injectable()
export class DetailUseCase {
	constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: DashboardRepository) {}

	async execute(advertising_id: number, dto: DetailDto, scope: AdvertisingScope): Promise<DetailRow[]> {
		// :id가 곧 스코프 키다. SQL이 이미 c.advertising_id로 한정하므로 조인을 늘리지 않고 소속 여부만 본다.
		// 403이 아니라 빈 배열인 이유는 프론트 QueryCache.onError가 403을 세션 만료로 보고 로그아웃시키기 때문이다.
		if (!isAdvertisingAllowed(scope, advertising_id)) {
			return [];
		}

		return this.dashboardRepository.detail(advertising_id, { start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) }, dto.media_id);
	}
}
