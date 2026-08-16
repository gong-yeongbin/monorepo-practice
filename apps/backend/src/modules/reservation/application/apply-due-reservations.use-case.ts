// 예약 시각이 지난 예약을 campaign에 적용하는 use-case (스케줄러가 매시 정각·부트 시 호출)
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RESERVATION_REPOSITORY, ReservationRepository } from '@reservation/domain/reservation.repository';

@Injectable()
export class ApplyDueReservationsUseCase {
	private readonly logger = new Logger(ApplyDueReservationsUseCase.name);

	constructor(@Inject(RESERVATION_REPOSITORY) private readonly reservationRepository: ReservationRepository) {}

	async execute(now: Date): Promise<void> {
		const due = await this.reservationRepository.findDue(now);
		if (due.length === 0) return;

		// 한 건 적용 실패가 나머지 예약 적용을 막지 않도록 실패는 로그로 격리한다
		const results = await Promise.allSettled(due.map((reservation) => this.reservationRepository.apply(reservation)));
		results.forEach((result, index) => {
			if (result.status === 'rejected') this.logger.error(`예약 적용 실패 (id=${due[index]?.id}): ${result.reason}`);
		});
	}
}
