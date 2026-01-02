import { DailyStatistic } from '@campaign/domain/entities';

export interface IDailyStatistic {
	findMany(token: string, startDate: Date, endDate: Date): Promise<DailyStatistic[]>;
	findManyTokenList(tokenList: string[], baseDate: Date): Promise<DailyStatistic[]>;
}
