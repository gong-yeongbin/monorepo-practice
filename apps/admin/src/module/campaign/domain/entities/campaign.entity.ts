import { $Enums, campaign } from '@repo/prisma';
import { DailyStatistic } from '@dashboard/domain/entities';

export class Campaign implements campaign {
	id: number;
	name: string;
	token: string;
	type: $Enums.Type;
	is_active: boolean;
	tracker_tracking_url: string;
	tracker_name: string;
	advertising_name: string;
	media_name: string;

	daily_statistic?: DailyStatistic[];
}
