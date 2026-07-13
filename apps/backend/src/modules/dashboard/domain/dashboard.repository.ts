// daily_report 집계 통계 조회 repository 인터페이스와 DI 토큰
import { DailyRow, DashboardRow, DetailRow } from '@dashboard/domain/statistics.entity';

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface DateRange {
	start_date: Date;
	end_date: Date;
}

export interface DashboardRepository {
	dashboard(date: Date): Promise<DashboardRow[]>;
	daily(token: string, range: DateRange): Promise<DailyRow[]>;
	detail(advertising_id: number, range: DateRange, media_id?: number): Promise<DetailRow[]>;
	dailyDetail(token: string, range: DateRange): Promise<DailyRow[]>;
	dailyDetailAll(range: DateRange): Promise<DailyRow[]>;
}
