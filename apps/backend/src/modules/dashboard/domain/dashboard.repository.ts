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

// advertising_ids는 USER의 허용 광고 목록이다. 생략(undefined)하면 제한 없음(DEVELOPER·ADMIN), []면 결과가 비어야 한다.
// detail은 advertising_id 자체가 스코프 키라 use-case에서 걸러지므로 인자가 없다.
export interface DashboardRepository {
	dashboard(date: Date, advertising_ids?: number[]): Promise<DashboardRow[]>;
	daily(range: DateRange, token?: string, advertising_ids?: number[]): Promise<DailyRow[]>;
	dailyDetail(range: DateRange, token: string, sort: CounterSort, advertising_ids?: number[]): Promise<DailyDetailRow[]>;
	detail(advertising_id: number, range: DateRange, media_id?: number): Promise<DetailRow[]>;
}
