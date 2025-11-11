import { DailyStatisticDto } from '@tracking/dto';

export interface IDailyStatistic {
	upsert(dailyStatistic: DailyStatisticDto): Promise<void>;
}
