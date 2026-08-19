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

// 트래킹 경로가 token 단위로 캐시하는 캠페인 스냅샷(요청별 파라미터 치환 전의 템플릿 URL)
export type CampaignSnapshot = Pick<Campaign, 'tracker_name' | 'tracker_tracking_url' | 'is_active'>;
