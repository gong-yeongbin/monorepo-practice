import { DailyStatistic } from '@campaign/domain/daily-statistic.entity';

export const DAILY_STATISTIC_REPOSITORY = Symbol('DAILY_STATISTIC_REPOSITORY');

export interface DailyStatisticRepository {
	upsert(dailyStatistic: DailyStatistic): Promise<void>;
}
