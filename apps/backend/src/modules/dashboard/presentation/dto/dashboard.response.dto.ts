// 대시보드 통계 응답 스키마(Swagger 문서용). 도메인 statistics 타입과 필드를 동일하게 유지한다
import { DailyRow, DashboardRow, DetailRow, ReportCounters } from '@dashboard/domain/statistics.entity';

class ReportCountersResponse implements ReportCounters {
	click: number;

	install: number;

	registration: number;

	retention: number;

	purchase: number;

	revenue: number;

	etc1: number;

	etc2: number;

	etc3: number;

	etc4: number;

	etc5: number;
}

export class DashboardRowResponse extends ReportCountersResponse implements DashboardRow {
	advertising_id: number;

	advertising_name: string;
}

export class DailyRowResponse extends ReportCountersResponse implements DailyRow {
	created_date: Date;

	unregistered: number;
}

export class DetailRowResponse extends ReportCountersResponse implements DetailRow {
	media_id: number;

	media_name: string;

	token: string;

	campaign_id: number;

	campaign_name: string;

	type: string;

	unregistered: number;

	is_active: boolean;
}
