import { Test } from '@nestjs/testing';
import { DetailUseCase } from './detail.use-case';
import { DASHBOARD_REPOSITORY } from '@dashboard/domain/dashboard.repository';

describe('DetailUseCase', () => {
	const dashboardRepository = { detail: jest.fn() };
	let useCase: DetailUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DetailUseCase, { provide: DASHBOARD_REPOSITORY, useValue: dashboardRepository }],
		}).compile();
		useCase = module.get(DetailUseCase);
	});

	it('media_id가 있으면 함께 넘긴다', async () => {
		const rows = [{ campaign_id: 3 }];
		dashboardRepository.detail.mockResolvedValue(rows);

		expect(await useCase.execute(1, { start_date: '2026-07-01', end_date: '2026-07-10', media_id: 2 }, [1])).toBe(rows);
		expect(dashboardRepository.detail).toHaveBeenCalledWith(1, { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 2);
	});

	it('media_id가 없으면 undefined로 넘긴다', async () => {
		dashboardRepository.detail.mockResolvedValue([]);

		await useCase.execute(1, { start_date: '2026-07-01', end_date: '2026-07-10' }, undefined);

		expect(dashboardRepository.detail).toHaveBeenCalledWith(1, { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, undefined);
	});

	// 403이 아니라 빈 배열이다 — 프론트가 403을 세션 만료로 보고 로그아웃시키기 때문
	it('허용 광고 밖이면 repository를 호출하지 않고 빈 배열을 반환한다', async () => {
		expect(await useCase.execute(2, { start_date: '2026-07-01', end_date: '2026-07-10' }, [1])).toEqual([]);
		expect(dashboardRepository.detail).not.toHaveBeenCalled();
	});
});
