// 예약 응답 스키마(Swagger 문서용). 도메인 타입과 필드를 동일하게 유지한다
import { ReservationListRow } from '@reservation/domain/reservation.entity';

export class ReservationListItemResponse implements ReservationListRow {
	id: number;

	campaign_id: number;

	name: string;

	tracking_url: string;

	reserved_at: Date | string;

	is_applied: boolean;

	campaign_name: string;

	media_name: string;
}
