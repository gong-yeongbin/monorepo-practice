import { Test } from '@nestjs/testing';
import { DailyDetailAllUseCase } from './daily-detail-all.use-case';
import { DASHBOARD_REPOSITORY } from '@dashboard/domain/dashboard.repository';

describe('DailyDetailAllUseCase', () => {
	const dashboardRepository = { dailyDetailAll: jest.fn() };
	let useCase: DailyDetailAllUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DailyDetailAllUseCase, { provide: DASHBOARD_REPOSITORY, useValue: dashboardRepository }],
		}).compile();
		useCase = module.get(DailyDetailAllUseCase);
	});

	it('변환된 날짜 범위를 repository에 넘긴다', async () => {
		const rows = [{ created_date: new Date('2026-07-10') }];
		dashboardRepository.dailyDetailAll.mockResolvedValue(rows);

		expect(await useCase.execute({ start_date: '2026-07-01', end_date: '2026-07-10' })).toBe(rows);
		expect(dashboardRepository.dailyDetailAll).toHaveBeenCalledWith({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') });
	});
});
