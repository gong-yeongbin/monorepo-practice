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

// 스케줄러가 적용할 예약. 적용 후 캠페인 캐시를 지워야 하는데 키가 token 기반이라 함께 실어 온다
export interface DueReservation extends Reservation {
	campaign_token: string;
}
