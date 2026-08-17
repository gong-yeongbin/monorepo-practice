// 캠페인 도메인 타입
import { CampaignConfig } from '@postback/domain/campaign-config.entity';

export type CampaignType = 'CPI' | 'CPA';

// 매체 포스트백 재전송에 필요한 최소 필드만 정의(도메인은 Prisma를 모르므로 구조적 타이핑)
export interface Media {
	install_postback_url: string;
	event_postback_url: string;
}

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
	media: Media;
	campaign_config: CampaignConfig[];
}
