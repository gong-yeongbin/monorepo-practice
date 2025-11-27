import { SumDailyStatistic } from '@dashboard/domain/entities';

export interface IDailyStatistic {
	findMany(tokens: string[], baseDate: Date): Promise<SumDailyStatistic>;
}
