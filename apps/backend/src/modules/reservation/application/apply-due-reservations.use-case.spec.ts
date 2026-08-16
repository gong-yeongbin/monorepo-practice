import { Test } from '@nestjs/testing';
import { ApplyDueReservationsUseCase } from './apply-due-reservations.use-case';
import { RESERVATION_REPOSITORY } from '@reservation/domain/reservation.repository';

describe('ApplyDueReservationsUseCase', () => {
	const reservationRepository = { findDue: jest.fn(), apply: jest.fn() };
	let useCase: ApplyDueReservationsUseCase;

	const now = new Date('2026-08-16T01:00:00Z');
	const due = [
		{ id: 1, campaign_id: 1, name: 'a', tracking_url: 'u1', reserved_at: now, is_applied: false },
		{ id: 2, campaign_id: 2, name: 'b', tracking_url: 'u2', reserved_at: now, is_applied: false },
	];

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [ApplyDueReservationsUseCase, { provide: RESERVATION_REPOSITORY, useValue: reservationRepository }],
		}).compile();
		useCase = module.get(ApplyDueReservationsUseCase);
	});

	it('시각이 지난 예약을 전부 적용한다', async () => {
		reservationRepository.findDue.mockResolvedValue(due);
		reservationRepository.apply.mockResolvedValue(undefined);

		await useCase.execute(now);

		expect(reservationRepository.findDue).toHaveBeenCalledWith(now);
		expect(reservationRepository.apply).toHaveBeenCalledTimes(2);
		expect(reservationRepository.apply).toHaveBeenCalledWith(due[0]);
		expect(reservationRepository.apply).toHaveBeenCalledWith(due[1]);
	});

	it('한 건 적용 실패가 나머지 적용을 막지 않는다', async () => {
		reservationRepository.findDue.mockResolvedValue(due);
		reservationRepository.apply.mockRejectedValueOnce(new Error('db down')).mockResolvedValueOnce(undefined);

		await expect(useCase.execute(now)).resolves.toBeUndefined();
		expect(reservationRepository.apply).toHaveBeenCalledTimes(2);
	});

	it('적용 대상이 없으면 아무것도 하지 않는다', async () => {
		reservationRepository.findDue.mockResolvedValue([]);

		await useCase.execute(now);

		expect(reservationRepository.apply).not.toHaveBeenCalled();
	});
});
