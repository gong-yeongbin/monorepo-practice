import { Test } from '@nestjs/testing';
import { ListAdvertiserUseCase } from './list-advertiser.use-case';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/advertiser.repository';

describe('ListAdvertiserUseCase', () => {
	const advertiserRepository = { findAll: jest.fn(), findByName: jest.fn(), create: jest.fn() };
	let useCase: ListAdvertiserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [ListAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useValue: advertiserRepository }],
		}).compile();

		useCase = module.get(ListAdvertiserUseCase);
	});

	it('repository의 전체 목록을 반환한다', async () => {
		const list = [{ id: 1, name: 'a' }];
		advertiserRepository.findAll.mockResolvedValue(list);

		expect(await useCase.execute()).toBe(list);
	});
});
