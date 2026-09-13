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

	it('검색·페이징 파라미터를 repository에 넘기고 항목·전체 건수를 그대로 돌려준다', async () => {
		const page = { items: [{ id: 1 }], total: 120 };
		advertisingRepository.list.mockResolvedValue(page);

		expect(await useCase.execute({ search: 'a', offset: 10, limit: 20 })).toBe(page);
		expect(advertisingRepository.list).toHaveBeenCalledWith({ search: 'a', offset: 10, limit: 20 });
	});
});
