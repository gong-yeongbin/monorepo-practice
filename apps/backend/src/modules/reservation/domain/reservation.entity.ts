// 예약(상위 트래커 URL 예약 변경) 도메인 타입 (reservation 테이블 레코드)
export interface Reservation {
	id: number;
	campaign_id: number;
	name: string;
	tracking_url: string;
	reserved_at: Date | string;
	is_applied: boolean;
}

// advertising 단위 예약 목록 조회 결과(대상 campaign명·media명 포함)
export interface ReservationListRow extends Reservation {
	campaign_name: string;
	media_name: string;
}
