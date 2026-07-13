import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DeleteAdvertisingUseCase } from './delete-advertising.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('DeleteAdvertisingUseCase', () => {
	const advertisingRepository = { exists: jest.fn(), countCampaign: jest.fn(), delete: jest.fn() };
	let useCase: DeleteAdvertisingUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DeleteAdvertisingUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(DeleteAdvertisingUseCase);
	});

	it('참조하는 campaign이 없으면 advertising을 삭제한다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);
		advertisingRepository.countCampaign.mockResolvedValue(0);

		await useCase.execute(1);
		expect(advertisingRepository.delete).toHaveBeenCalledWith(1);
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		advertisingRepository.exists.mockResolvedValue(false);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
		expect(advertisingRepository.delete).not.toHaveBeenCalled();
	});

	it('참조하는 campaign이 있으면 ConflictException을 던진다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);
		advertisingRepository.countCampaign.mockResolvedValue(2);

		await expect(useCase.execute(1)).rejects.toThrow(ConflictException);
		expect(advertisingRepository.delete).not.toHaveBeenCalled();
	});
});
