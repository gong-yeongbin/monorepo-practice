// tracker 도메인 타입(DB 컬럼과 동일한 snake_case)
export interface Tracker {
	id: number;
	name: string;
	tracking_url: string;
	install_postback_url: string;
	event_postback_url: string;
}
