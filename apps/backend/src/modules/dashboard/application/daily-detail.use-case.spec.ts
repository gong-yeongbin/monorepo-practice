import { Test } from '@nestjs/testing';
import { DailyDetailUseCase } from './daily-detail.use-case';
import { DASHBOARD_REPOSITORY } from '@dashboard/domain/dashboard.repository';

describe('DailyDetailUseCase', () => {
	const dashboardRepository = { dailyDetail: jest.fn() };
	let useCase: DailyDetailUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DailyDetailUseCase, { provide: DASHBOARD_REPOSITORY, useValue: dashboardRepository }],
		}).compile();
		useCase = module.get(DailyDetailUseCase);
	});

	it('변환된 날짜 범위·token·정렬 조건과 스코프를 repository에 넘긴다', async () => {
		const rows = [{ view_code: 'vc1' }];
		dashboardRepository.dailyDetail.mockResolvedValue(rows);

		expect(
			await useCase.execute({ token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10', type: 'install', order: 'desc' }, [1])
		).toBe(rows);
		expect(dashboardRepository.dailyDetail).toHaveBeenCalledWith(
			{ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') },
			'tok',
			{ field: 'install', order: 'desc' },
			[1]
		);
	});
});
