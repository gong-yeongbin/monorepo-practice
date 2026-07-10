import { DailyReport } from '@campaign/domain/daily-report.entity';

export const DAILY_REPORT_REPOSITORY = Symbol('DAILY_REPORT_REPOSITORY');

export interface DailyReportRepository {
	upsert(dailyReport: DailyReport): Promise<void>;
}
