// daily_report 집계 통계 조회 repository 인터페이스와 DI 토큰
import { DailyRow, DashboardRow, DetailRow } from '@dashboard/domain/statistics.entity';

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface DateRange {
	start_date: Date;
	end_date: Date;
}

export interface DashboardRepository {
	dashboard(date: Date): Promise<DashboardRow[]>;
	daily(range: DateRange, token?: string): Promise<DailyRow[]>;
	detail(advertising_id: number, range: DateRange, media_id?: number): Promise<DetailRow[]>;
}
