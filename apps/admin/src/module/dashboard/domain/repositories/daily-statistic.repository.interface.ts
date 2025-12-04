import { SumDailyStatistic } from '@dashboard/domain/entities';

export interface IDailyStatistic {
	findManyByAdvertising(tokens: string[], baseDate: Date): Promise<SumDailyStatistic | null>;
	findManyByCampaign(token: string, startDate: Date, endDate: Date): Promise<SumDailyStatistic | null>;
}
