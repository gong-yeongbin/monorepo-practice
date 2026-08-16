// 예약을 삭제하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RESERVATION_REPOSITORY, ReservationRepository } from '@reservation/domain/reservation.repository';

@Injectable()
export class DeleteReservationUseCase {
	constructor(@Inject(RESERVATION_REPOSITORY) private readonly reservationRepository: ReservationRepository) {}

	async execute(id: number): Promise<void> {
		if (!(await this.reservationRepository.findById(id))) {
			throw new NotFoundException();
		}

		await this.reservationRepository.delete(id);
	}
}
