import { Test } from '@nestjs/testing';
import { ListReservationsUseCase } from './list-reservations.use-case';
import { RESERVATION_REPOSITORY } from '@reservation/domain/reservation.repository';

describe('ListReservationsUseCase', () => {
	const reservationRepository = { findByAdvertisingId: jest.fn() };
	let useCase: ListReservationsUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [ListReservationsUseCase, { provide: RESERVATION_REPOSITORY, useValue: reservationRepository }],
		}).compile();
		useCase = module.get(ListReservationsUseCase);
	});

	it('advertising_id로 예약 목록을 반환한다', async () => {
		const list = [{ id: 1 }];
		reservationRepository.findByAdvertisingId.mockResolvedValue(list);

		expect(await useCase.execute(1)).toBe(list);
		expect(reservationRepository.findByAdvertisingId).toHaveBeenCalledWith(1);
	});
});
