import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAdvertiserUseCase } from './get-advertiser.use-case';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/advertiser.repository';

describe('GetAdvertiserUseCase', () => {
	const advertiserRepository = { findById: jest.fn() };
	let useCase: GetAdvertiserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [GetAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useValue: advertiserRepository }],
		}).compile();
		useCase = module.get(GetAdvertiserUseCase);
	});

	it('존재하면 advertiser를 반환한다', async () => {
		const advertiser = { id: 1, name: 'a' };
		advertiserRepository.findById.mockResolvedValue(advertiser);

		expect(await useCase.execute(1)).toBe(advertiser);
	});

	it('없으면 NotFoundException을 던진다', async () => {
		advertiserRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
	});
});
