// campaign_config 이벤트 매핑 도메인 타입(DB 컬럼과 동일한 snake_case)
export interface CampaignConfig {
	id: number;
	campaign_id: number;
	send_media: boolean;
	tracker_event_name: string;
	admin_event_name: string;
	media_event_name: string;
}
