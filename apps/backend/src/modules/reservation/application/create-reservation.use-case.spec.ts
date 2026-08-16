import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateReservationUseCase } from './create-reservation.use-case';
import { RESERVATION_REPOSITORY } from '@reservation/domain/reservation.repository';

describe('CreateReservationUseCase', () => {
	const reservationRepository = { countCampaigns: jest.fn(), createMany: jest.fn() };
	let useCase: CreateReservationUseCase;

	const dto = { name: '변경명', tracking_url: 'https://new.example.com', reserved_at: '2026-08-20 10:00:00', campaign_ids: [1, 2] };

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [CreateReservationUseCase, { provide: RESERVATION_REPOSITORY, useValue: reservationRepository }],
		}).compile();
		useCase = module.get(CreateReservationUseCase);
	});

	it('reserved_at을 KST 기준 Date로 변환해 캠페인마다 예약 행을 생성한다', async () => {
		reservationRepository.countCampaigns.mockResolvedValue(2);

		await useCase.execute(dto);

		const reserved_at = new Date('2026-08-20T01:00:00.000Z'); // 2026-08-20 10:00 KST
		expect(reservationRepository.createMany).toHaveBeenCalledWith([
			{ campaign_id: 1, name: '변경명', tracking_url: 'https://new.example.com', reserved_at },
			{ campaign_id: 2, name: '변경명', tracking_url: 'https://new.example.com', reserved_at },
		]);
	});

	it('없는 campaign이 섞여 있으면 NotFoundException을 던지고 생성하지 않는다', async () => {
		reservationRepository.countCampaigns.mockResolvedValue(1);

		await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
		expect(reservationRepository.createMany).not.toHaveBeenCalled();
	});
});
