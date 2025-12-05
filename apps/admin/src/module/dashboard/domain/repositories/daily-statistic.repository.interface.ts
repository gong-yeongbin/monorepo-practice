import { DashboardAdvertising, DashboardCampaign } from '@dashboard/domain/entities';
import { DashboardMedia } from '@dashboard/domain/entities/dashboard-media.entity';

export interface IDailyStatistic {
	dashboardAdvertising(tokens: string[], baseDate: Date): Promise<DashboardAdvertising | null>;
	dashboardCampaign(token: string, startDate: Date, endDate: Date): Promise<DashboardCampaign | null>;
	dashboardMedia(token: string, startDate: Date, endDate: Date): Promise<DashboardMedia[] | null>;
}
