import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteReservationUseCase } from './delete-reservation.use-case';
import { RESERVATION_REPOSITORY } from '@reservation/domain/reservation.repository';

describe('DeleteReservationUseCase', () => {
	const reservationRepository = { findById: jest.fn(), delete: jest.fn() };
	let useCase: DeleteReservationUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DeleteReservationUseCase, { provide: RESERVATION_REPOSITORY, useValue: reservationRepository }],
		}).compile();
		useCase = module.get(DeleteReservationUseCase);
	});

	it('존재하면 삭제한다', async () => {
		reservationRepository.findById.mockResolvedValue({ id: 1 });

		await useCase.execute(1);

		expect(reservationRepository.delete).toHaveBeenCalledWith(1);
	});

	it('없으면 NotFoundException을 던진다', async () => {
		reservationRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(99)).rejects.toThrow(NotFoundException);
		expect(reservationRepository.delete).not.toHaveBeenCalled();
	});
});
