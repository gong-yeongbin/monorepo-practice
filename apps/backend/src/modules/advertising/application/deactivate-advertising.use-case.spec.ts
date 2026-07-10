import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeactivateAdvertisingUseCase } from './deactivate-advertising.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('DeactivateAdvertisingUseCase', () => {
	const advertisingRepository = { exists: jest.fn(), deactivateCampaigns: jest.fn() };
	let useCase: DeactivateAdvertisingUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DeactivateAdvertisingUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(DeactivateAdvertisingUseCase);
	});

	it('존재하면 딸린 campaign을 비활성화한다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);

		await useCase.execute(1);

		expect(advertisingRepository.deactivateCampaigns).toHaveBeenCalledWith(1);
	});

	it('없으면 NotFoundException을 던지고 비활성화하지 않는다', async () => {
		advertisingRepository.exists.mockResolvedValue(false);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
		expect(advertisingRepository.deactivateCampaigns).not.toHaveBeenCalled();
	});
});
