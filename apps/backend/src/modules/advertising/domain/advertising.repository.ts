// advertising 조회·생성·통계 집계 repository 인터페이스와 DI 토큰
import { Advertising, AdvertisingBrief, AdvertisingInfo, AdvertisingListItem } from '@advertising/domain/advertising.entity';
import { DailyRow, DashboardRow, DetailRow } from '@advertising/domain/statistics.entity';

export const ADVERTISING_REPOSITORY = Symbol('ADVERTISING_REPOSITORY');

export interface CreateAdvertisingProps {
	name: string;
	image: string | null;
	advertiser_id: number;
	tracker_id: number;
}

export interface ListAdvertisingParams {
	search: string;
	offset: number;
	limit: number;
}

export interface DateRange {
	start_date: Date;
	end_date: Date;
}

export interface CampaignListRow {
	campaign_id: number;
	token: string;
	campaign_name: string;
	type: string;
	is_active: boolean;
	media_name: string;
}

export interface AdvertisingRepository {
	// CRUD
	exists(id: number): Promise<boolean>;
	trackerExists(tracker_id: number): Promise<boolean>;
	advertiserExists(advertiser_id: number): Promise<boolean>;
	findByName(name: string): Promise<Advertising | null>;
	create(props: CreateAdvertisingProps): Promise<Advertising>;
	list(params: ListAdvertisingParams): Promise<AdvertisingListItem[]>;
	brief(): Promise<AdvertisingBrief[]>;
	info(id: number): Promise<AdvertisingInfo | null>;
	campaignList(advertising_id: number): Promise<CampaignListRow[]>;
	deactivateCampaigns(advertising_id: number): Promise<void>;

	// 통계(daily_report 집계)
	dashboard(date: Date): Promise<DashboardRow[]>;
	daily(token: string, range: DateRange): Promise<DailyRow[]>;
	detail(advertising_id: number, range: DateRange, media_id?: number): Promise<DetailRow[]>;
	dailyDetail(token: string, range: DateRange): Promise<DailyRow[]>;
	dailyDetailAll(range: DateRange): Promise<DailyRow[]>;
}
