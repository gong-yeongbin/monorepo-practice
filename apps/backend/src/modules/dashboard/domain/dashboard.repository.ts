// daily_report 집계 통계 조회 repository 인터페이스와 DI 토큰
import { DailyDetailRow, DailyRow, DashboardRow, DetailRow, ReportCounters } from '@dashboard/domain/statistics.entity';

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface DateRange {
	start_date: Date;
	end_date: Date;
}

// 일자별 상세의 정렬 조건(카운터 컬럼 + 방향)
export interface CounterSort {
	field: keyof ReportCounters;
	order: 'asc' | 'desc';
}

export interface DashboardRepository {
	dashboard(date: Date): Promise<DashboardRow[]>;
	daily(range: DateRange, token?: string): Promise<DailyRow[]>;
	dailyDetail(range: DateRange, token: string, sort: CounterSort): Promise<DailyDetailRow[]>;
	detail(advertising_id: number, range: DateRange, media_id?: number): Promise<DetailRow[]>;
}
