// advertising 조회·생성 repository 인터페이스와 DI 토큰
import { Advertising, AdvertisingBrief, AdvertisingInfo, AdvertisingListItem } from '@advertising/domain/advertising.entity';

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

export interface CampaignListRow {
	campaign_id: number;
	token: string;
	campaign_name: string;
	type: string;
	is_active: boolean;
	media_name: string;
}

export interface AdvertisingRepository {
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
}
