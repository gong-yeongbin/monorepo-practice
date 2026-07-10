// 일별 리포트 upsert repository 인터페이스와 DI 토큰
import { DailyReport } from '@tracking/domain/daily-report.entity';

export const DAILY_REPORT_REPOSITORY = Symbol('DAILY_REPORT_REPOSITORY');

export interface DailyReportRepository {
	upsert(dailyReport: DailyReport): Promise<void>;
}
