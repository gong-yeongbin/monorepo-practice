// 캠페인 이벤트 매핑 설정 도메인 타입
export interface CampaignConfig {
	id: number;
	send_media: boolean;
	tracker_event_name: string;
	admin_event_name: string;
	media_event_name: string;
	campaign_id: number;
}
