import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DeleteTrackerUseCase } from './delete-tracker.use-case';
import { TRACKER_REPOSITORY } from '@tracker/domain/tracker.repository';

describe('DeleteTrackerUseCase', () => {
	const trackerRepository = { findById: jest.fn(), countAdvertising: jest.fn(), delete: jest.fn() };
	let useCase: DeleteTrackerUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DeleteTrackerUseCase, { provide: TRACKER_REPOSITORY, useValue: trackerRepository }],
		}).compile();
		useCase = module.get(DeleteTrackerUseCase);
	});

	it('참조하는 advertising이 없으면 tracker를 삭제한다', async () => {
		trackerRepository.findById.mockResolvedValue({ id: 1, name: 'appsflyer' });
		trackerRepository.countAdvertising.mockResolvedValue(0);

		await useCase.execute(1);
		expect(trackerRepository.delete).toHaveBeenCalledWith(1);
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		trackerRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
		expect(trackerRepository.delete).not.toHaveBeenCalled();
	});

	it('참조하는 advertising이 있으면 ConflictException을 던진다', async () => {
		trackerRepository.findById.mockResolvedValue({ id: 1, name: 'appsflyer' });
		trackerRepository.countAdvertising.mockResolvedValue(2);

		await expect(useCase.execute(1)).rejects.toThrow(ConflictException);
		expect(trackerRepository.delete).not.toHaveBeenCalled();
	});
});
