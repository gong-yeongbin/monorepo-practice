import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAdvertisingUseCase } from './get-advertising.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('GetAdvertisingUseCase', () => {
	const advertisingRepository = { get: jest.fn() };
	let useCase: GetAdvertisingUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [GetAdvertisingUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(GetAdvertisingUseCase);
	});

	it('존재하면 info를 반환한다', async () => {
		const info = { advertiser: 'a', tracker: 't', advertising: 'ad', image: null, media: [] };
		advertisingRepository.get.mockResolvedValue(info);

		expect(await useCase.execute(1)).toBe(info);
	});

	it('없으면 NotFoundException', async () => {
		advertisingRepository.get.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
	});
});
