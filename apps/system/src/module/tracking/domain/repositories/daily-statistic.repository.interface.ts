import { DailyStatisticDto } from '@tracking/dto';
import { DailyStatistic } from '@tracking/domain/entities';

export interface IDailyStatistic {
	find(viewCode: string, baseDate: Date): Promise<DailyStatistic | null>;
	upsert(dailyStatistic: DailyStatisticDto): Promise<void>;
}
