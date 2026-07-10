import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InfoAdvertisingUseCase } from './info-advertising.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('InfoAdvertisingUseCase', () => {
	const advertisingRepository = { info: jest.fn() };
	let useCase: InfoAdvertisingUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [InfoAdvertisingUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(InfoAdvertisingUseCase);
	});

	it('존재하면 info를 반환한다', async () => {
		const info = { advertiser: 'a', tracker: 't', advertising: 'ad', image: null, media: [] };
		advertisingRepository.info.mockResolvedValue(info);

		expect(await useCase.execute(1)).toBe(info);
	});

	it('없으면 NotFoundException', async () => {
		advertisingRepository.info.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
	});
});
