import { Test } from '@nestjs/testing';
import { DailyUseCase } from './daily.use-case';
import { DASHBOARD_REPOSITORY } from '@dashboard/domain/dashboard.repository';

describe('DailyUseCase', () => {
	const dashboardRepository = { daily: jest.fn() };
	let useCase: DailyUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DailyUseCase, { provide: DASHBOARD_REPOSITORY, useValue: dashboardRepository }],
		}).compile();
		useCase = module.get(DailyUseCase);
	});

	it('변환된 날짜 범위와 token을 repository에 넘긴다', async () => {
		const rows = [{ created_date: new Date('2026-07-10') }];
		dashboardRepository.daily.mockResolvedValue(rows);

		expect(await useCase.execute({ token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' }, [1])).toBe(rows);
		expect(dashboardRepository.daily).toHaveBeenCalledWith({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 'tok', [1]);
	});

	// token 생략 시 전체 합산이 되므로, 스코프가 repository까지 전달되지 않으면 허용 목록 밖 데이터가 샌다
	it('token이 없어도 스코프는 그대로 넘긴다(전체 합산 누수 방지)', async () => {
		const rows = [{ created_date: new Date('2026-07-10') }];
		dashboardRepository.daily.mockResolvedValue(rows);

		expect(await useCase.execute({ start_date: '2026-07-01', end_date: '2026-07-10' }, [1])).toBe(rows);
		expect(dashboardRepository.daily).toHaveBeenCalledWith({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, undefined, [1]);
	});
});
