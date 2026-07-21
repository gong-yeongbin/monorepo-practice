// PrismaDashboardRepository의 daily_report 통계 집계를 검증
import { PrismaDashboardRepository } from './prisma-dashboard.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaDashboardRepository', () => {
	const daily_report = { groupBy: jest.fn() };
	const $queryRaw = jest.fn();
	const prisma = { daily_report, $queryRaw } as unknown as PrismaService;
	const repository = new PrismaDashboardRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('dashboard는 $queryRaw 결과를 그대로 반환한다', async () => {
		const rows = [{ advertising_id: 1, advertising_name: 'a', click: 10 }];
		$queryRaw.mockResolvedValue(rows);

		expect(await repository.dashboard(new Date('2026-07-10'))).toBe(rows);
		expect($queryRaw).toHaveBeenCalled();
	});

	it('detail은 media_id가 있으면 $queryRaw 결과를 반환한다', async () => {
		const rows = [{ campaign_id: 3, click: 5 }];
		$queryRaw.mockResolvedValue(rows);

		expect(await repository.detail(1, { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 2)).toBe(rows);
	});

	it('detail은 media_id가 없어도 동작한다(매체 필터 없음)', async () => {
		const rows = [{ campaign_id: 4 }];
		$queryRaw.mockResolvedValue(rows);

		expect(await repository.detail(1, { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') })).toBe(rows);
	});

	it('daily는 groupBy 합계를 매핑하고 모든 카운터의 null 합계를 0으로 채운다', async () => {
		daily_report.groupBy.mockResolvedValue([
			// 모든 필드에 값이 있는 행
			{ created_date: new Date('2026-07-10'), _sum: { click: 1, install: 2, registration: 3, retention: 4, purchase: 5, revenue: 6, etc1: 7, etc2: 8, etc3: 9, etc4: 10, etc5: 11, unregistered: 12 } },
			// 모든 필드가 null인 행(전부 0으로 채워져야 함)
			{ created_date: new Date('2026-07-09'), _sum: { click: null, install: null, registration: null, retention: null, purchase: null, revenue: null, etc1: null, etc2: null, etc3: null, etc4: null, etc5: null, unregistered: null } },
		]);

		const result = await repository.daily({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 'tok');

		expect(result[0]).toEqual({
			created_date: new Date('2026-07-10'),
			click: 1, install: 2, registration: 3, retention: 4, purchase: 5, revenue: 6,
			etc1: 7, etc2: 8, etc3: 9, etc4: 10, etc5: 11, unregistered: 12,
		});
		expect(result[1]).toEqual({
			created_date: new Date('2026-07-09'),
			click: 0, install: 0, registration: 0, retention: 0, purchase: 0, revenue: 0,
			etc1: 0, etc2: 0, etc3: 0, etc4: 0, etc5: 0, unregistered: 0,
		});
		expect(daily_report.groupBy).toHaveBeenCalledWith(expect.objectContaining({ by: ['created_date'], where: expect.objectContaining({ token: 'tok' }) }));
	});

	it('daily는 token이 없으면 token 필터 없이 날짜 범위 전체를 합산한다', async () => {
		daily_report.groupBy.mockResolvedValue([
			{ created_date: new Date('2026-07-10'), _sum: { click: 3, install: 1, registration: 0, retention: 0, purchase: 0, revenue: 0, etc1: 0, etc2: 0, etc3: 0, etc4: 0, etc5: 0, unregistered: 0 } },
		]);

		const result = await repository.daily({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') });

		expect(result[0]).toEqual(expect.objectContaining({ click: 3, install: 1 }));
		const call = daily_report.groupBy.mock.calls[0][0];
		expect(call.where.token).toBeUndefined();
		expect(call.where.created_date).toBeDefined();
	});
});
