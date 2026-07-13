// campaign 어드민 도메인 타입(DB 컬럼과 동일한 snake_case)
export type CampaignType = 'CPI' | 'CPA';

export interface Campaign {
	id: number;
	token: string;
	name: string;
	type: CampaignType;
	is_active: boolean;
	tracker_name: string;
	tracker_tracking_url: string;
	advertising_id: number;
	media_id: number;
}
