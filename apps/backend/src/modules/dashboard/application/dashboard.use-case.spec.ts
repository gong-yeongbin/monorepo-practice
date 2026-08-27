import { Test } from '@nestjs/testing';
import { DashboardUseCase } from './dashboard.use-case';
import { DASHBOARD_REPOSITORY } from '@dashboard/domain/dashboard.repository';

describe('DashboardUseCase', () => {
	const dashboardRepository = { dashboard: jest.fn() };
	let useCase: DashboardUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DashboardUseCase, { provide: DASHBOARD_REPOSITORY, useValue: dashboardRepository }],
		}).compile();
		useCase = module.get(DashboardUseCase);
	});

	it('date 문자열을 Date로 변환하고 스코프와 함께 repository에 넘긴다', async () => {
		const rows = [{ advertising_id: 1 }];
		dashboardRepository.dashboard.mockResolvedValue(rows);

		expect(await useCase.execute({ date: '2026-07-10' }, [1, 2])).toBe(rows);
		expect(dashboardRepository.dashboard).toHaveBeenCalledWith(new Date('2026-07-10'), [1, 2]);
	});

	it('면제(undefined) 스코프는 그대로 넘긴다', async () => {
		dashboardRepository.dashboard.mockResolvedValue([]);

		await useCase.execute({ date: '2026-07-10' }, undefined);

		expect(dashboardRepository.dashboard).toHaveBeenCalledWith(new Date('2026-07-10'), undefined);
	});
});
