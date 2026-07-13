import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DeleteAdvertiserUseCase } from './delete-advertiser.use-case';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/advertiser.repository';

describe('DeleteAdvertiserUseCase', () => {
	const advertiserRepository = { findById: jest.fn(), countAdvertising: jest.fn(), delete: jest.fn() };
	let useCase: DeleteAdvertiserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DeleteAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useValue: advertiserRepository }],
		}).compile();
		useCase = module.get(DeleteAdvertiserUseCase);
	});

	it('참조하는 advertising이 없으면 advertiser를 삭제한다', async () => {
		advertiserRepository.findById.mockResolvedValue({ id: 1, name: 'a' });
		advertiserRepository.countAdvertising.mockResolvedValue(0);

		await useCase.execute(1);
		expect(advertiserRepository.delete).toHaveBeenCalledWith(1);
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		advertiserRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
		expect(advertiserRepository.delete).not.toHaveBeenCalled();
	});

	it('참조하는 advertising이 있으면 ConflictException을 던진다', async () => {
		advertiserRepository.findById.mockResolvedValue({ id: 1, name: 'a' });
		advertiserRepository.countAdvertising.mockResolvedValue(2);

		await expect(useCase.execute(1)).rejects.toThrow(ConflictException);
		expect(advertiserRepository.delete).not.toHaveBeenCalled();
	});
});
