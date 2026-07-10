// 캠페인 도메인 타입
import { CampaignConfig } from '@tracking/domain/campaign-config.entity';

export type CampaignType = 'CPI' | 'CPA';

export interface Campaign {
	id: number;
	name: string;
	token: string;
	type: CampaignType;
	is_active: boolean;
	tracker_tracking_url: string;
	tracker_name: string;
	advertising_id: number;
	media_id: number;
	campaign_config: CampaignConfig[];
}
