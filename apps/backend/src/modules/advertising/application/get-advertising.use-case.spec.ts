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

		expect(await useCase.execute(1, undefined)).toBe(info);
	});

	it('없으면 NotFoundException', async () => {
		advertisingRepository.get.mockResolvedValue(null);

		await expect(useCase.execute(1, undefined)).rejects.toThrow(NotFoundException);
	});

	it('허용 광고면 info를 반환한다', async () => {
		const info = { advertiser: 'a', tracker: 't', advertising: 'ad', image: null, media: [] };
		advertisingRepository.get.mockResolvedValue(info);

		expect(await useCase.execute(1, [1])).toBe(info);
	});

	// 존재 여부도 노출하지 않는다. 403이 아닌 이유는 프론트가 403을 세션 만료로 보고 로그아웃시키기 때문
	it('허용 광고 밖이면 조회하지 않고 NotFoundException', async () => {
		await expect(useCase.execute(2, [1])).rejects.toThrow(NotFoundException);
		expect(advertisingRepository.get).not.toHaveBeenCalled();
	});
});
