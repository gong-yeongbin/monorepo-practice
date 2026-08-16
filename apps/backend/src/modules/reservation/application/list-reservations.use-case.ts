// advertising 단위로 예약 목록을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { ReservationListRow } from '@reservation/domain/reservation.entity';
import { RESERVATION_REPOSITORY, ReservationRepository } from '@reservation/domain/reservation.repository';

@Injectable()
export class ListReservationsUseCase {
	constructor(@Inject(RESERVATION_REPOSITORY) private readonly reservationRepository: ReservationRepository) {}

	async execute(advertising_id: number): Promise<ReservationListRow[]> {
		return this.reservationRepository.findByAdvertisingId(advertising_id);
	}
}
