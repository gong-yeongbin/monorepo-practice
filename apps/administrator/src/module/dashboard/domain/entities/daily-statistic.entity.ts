import { daily_statistic } from '@repo/prisma';

export class DailyStatistic implements daily_statistic {
	id: number;
	view_code: string;
	token: string;
	pub_id: string | null;
	sub_id: string | null;
	click: number;
	install: number;
	registration: number;
	retention: number;
	purchase: number;
	revenue: number;
	etc1: number;
	etc2: number;
	etc3: number;
	etc4: number;
	etc5: number;
	unregistered: number;
	created_at: Date;
}
