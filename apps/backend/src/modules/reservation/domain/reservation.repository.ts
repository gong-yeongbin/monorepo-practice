// 예약 생성·조회·삭제 repository 인터페이스와 DI 토큰
import { DueReservation, Reservation, ReservationListRow } from '@reservation/domain/reservation.entity';

export const RESERVATION_REPOSITORY = Symbol('RESERVATION_REPOSITORY');

export interface CreateReservationProps {
	campaign_id: number;
	name: string;
	tracking_url: string;
	reserved_at: Date;
}

export interface ReservationRepository {
	createMany(props: CreateReservationProps[]): Promise<void>;
	findByAdvertisingId(advertising_id: number): Promise<ReservationListRow[]>;
	findById(id: number): Promise<Reservation | null>;
	delete(id: number): Promise<void>;
	countCampaigns(campaign_ids: number[]): Promise<number>;
	findDue(now: Date): Promise<DueReservation[]>;
	apply(reservation: Reservation): Promise<void>;
}
