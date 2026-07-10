import { Test } from '@nestjs/testing';
import { DashboardUseCase } from './dashboard.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('DashboardUseCase', () => {
	const advertisingRepository = { dashboard: jest.fn() };
	let useCase: DashboardUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DashboardUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(DashboardUseCase);
	});

	it('date 문자열을 Date로 변환해 repository에 넘긴다', async () => {
		const rows = [{ advertising_id: 1 }];
		advertisingRepository.dashboard.mockResolvedValue(rows);

		expect(await useCase.execute({ date: '2026-07-10' })).toBe(rows);
		expect(advertisingRepository.dashboard).toHaveBeenCalledWith(new Date('2026-07-10'));
	});
});
