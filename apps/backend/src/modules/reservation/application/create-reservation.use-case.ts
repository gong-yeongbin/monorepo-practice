// 대상 캠페인 존재를 검증하고 선택 캠페인마다 예약 행을 생성하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RESERVATION_REPOSITORY, ReservationRepository } from '@reservation/domain/reservation.repository';
import { CreateReservationDto } from '@reservation/application/dto/create-reservation.dto';
import { kstDateTime } from '@common/utils/date.util';

@Injectable()
export class CreateReservationUseCase {
	constructor(@Inject(RESERVATION_REPOSITORY) private readonly reservationRepository: ReservationRepository) {}

	async execute(dto: CreateReservationDto): Promise<void> {
		// campaign_ids는 DTO에서 중복이 거부되므로(count = 고유 id 수) 개수 비교만으로 전부 존재하는지 알 수 있다
		if ((await this.reservationRepository.countCampaigns(dto.campaign_ids)) !== dto.campaign_ids.length) {
			throw new NotFoundException('campaign not found');
		}

		const reserved_at = kstDateTime(dto.reserved_at);
		await this.reservationRepository.createMany(
			dto.campaign_ids.map((campaign_id) => ({ campaign_id, name: dto.name, tracking_url: dto.tracking_url, reserved_at }))
		);
	}
}
