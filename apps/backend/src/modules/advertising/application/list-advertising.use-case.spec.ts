import { Test } from '@nestjs/testing';
import { ListAdvertisingUseCase } from './list-advertising.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('ListAdvertisingUseCase', () => {
	const advertisingRepository = { list: jest.fn() };
	let useCase: ListAdvertisingUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [ListAdvertisingUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(ListAdvertisingUseCase);
	});

	it('검색·페이징 파라미터를 repository에 넘긴다', async () => {
		const list = [{ id: 1 }];
		advertisingRepository.list.mockResolvedValue(list);

		expect(await useCase.execute({ search: 'a', offset: 10, limit: 20 })).toBe(list);
		expect(advertisingRepository.list).toHaveBeenCalledWith({ search: 'a', offset: 10, limit: 20 });
	});
});
