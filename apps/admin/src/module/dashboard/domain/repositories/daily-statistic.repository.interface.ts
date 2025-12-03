import { SumDailyStatistic } from '@dashboard/domain/entities';

export interface IDailyStatistic {
	findManyByAdvertising(tokens: string[], baseDate: Date): Promise<SumDailyStatistic | null>;
	findManyByCampaign(tokens: string[], startDate: Date, endDate: Date): Promise<SumDailyStatistic | null>;
}
