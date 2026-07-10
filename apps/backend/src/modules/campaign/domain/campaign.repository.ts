// campaign·campaign_config 조회·변경 repository 인터페이스와 DI 토큰
import { Campaign, CampaignConfig, CampaignType } from '@campaign/domain/campaign.entity';

export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');

// 생성 시 advertising에서 도출하는 tracker 정보
export interface AdvertisingTrackerInfo {
	tracker_name: string;
	tracker_tracking_url: string;
}

export interface CreateCampaignProps {
	name: string;
	type: CampaignType;
	advertising_id: number;
	media_id: number;
	tracker_name: string;
	tracker_tracking_url: string;
}

export interface UpsertConfigProps {
	send_media: boolean;
	tracker_event_name: string;
	admin_event_name: string;
	media_event_name: string;
}

export interface CampaignRepository {
	findById(id: number): Promise<Campaign | null>;
	findAdvertisingTracker(advertising_id: number): Promise<AdvertisingTrackerInfo | null>;
	mediaExists(media_id: number): Promise<boolean>;
	create(props: CreateCampaignProps): Promise<Campaign>;
	delete(id: number): Promise<void>;
	setActive(id: number, is_active: boolean): Promise<void>;
	findConfigs(campaign_id: number): Promise<CampaignConfig[]>;
	replaceConfigs(campaign_id: number, configs: UpsertConfigProps[]): Promise<void>;
}
