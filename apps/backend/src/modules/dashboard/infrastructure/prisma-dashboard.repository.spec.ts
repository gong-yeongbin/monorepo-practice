// PrismaDashboardRepository의 daily_report 통계 집계를 검증
import { PrismaDashboardRepository } from './prisma-dashboard.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaDashboardRepository', () => {
	const daily_report = { groupBy: jest.fn() };
	const $queryRaw = jest.fn();
	const prisma = { daily_report, $queryRaw } as unknown as PrismaService;
	const repository = new PrismaDashboardRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('dashboard는 $queryRaw의 BigInt 카운터를 number로 변환해 반환한다', async () => {
		// CAST(SUM ... AS BIGINT)는 Prisma가 BigInt로 반환한다 — JSON 직렬화를 위해 number 변환 필수
		$queryRaw.mockResolvedValue([{ advertising_id: 1, advertising_name: 'a', click: BigInt(10) }]);

		expect(await repository.dashboard(new Date('2026-07-10'))).toEqual([{ advertising_id: 1, advertising_name: 'a', click: 10 }]);
		expect($queryRaw).toHaveBeenCalled();
	});

	// raw SQL의 IN ()은 문법 오류이고 Prisma.join([])은 예외를 던지므로, 빈 스코프는 쿼리 자체를 보내지 않아야 한다
	it('dashboard는 허용 목록이 비면 쿼리를 보내지 않고 빈 배열을 반환한다', async () => {
		expect(await repository.dashboard(new Date('2026-07-10'), [])).toEqual([]);
		expect($queryRaw).not.toHaveBeenCalled();
	});

	it('dashboard는 허용 목록이 있으면 스코프 필터를 붙여 조회한다', async () => {
		$queryRaw.mockResolvedValue([{ advertising_id: 1, click: BigInt(1) }]);

		expect(await repository.dashboard(new Date('2026-07-10'), [1, 2])).toEqual([{ advertising_id: 1, click: 1 }]);
		expect($queryRaw).toHaveBeenCalled();
	});

	it('detail은 media_id가 있으면 BigInt 카운터를 number로 변환해 반환한다', async () => {
		$queryRaw.mockResolvedValue([{ campaign_id: 3, click: BigInt(5) }]);

		expect(await repository.detail(1, { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 2)).toEqual([{ campaign_id: 3, click: 5 }]);
	});

	it('detail은 media_id가 없어도 동작한다(매체 필터 없음)', async () => {
		$queryRaw.mockResolvedValue([{ campaign_id: 4 }]);

		expect(await repository.detail(1, { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') })).toEqual([{ campaign_id: 4 }]);
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

	it('dailyDetail은 view_code·pub_id·sub_id 단위 합계를 매핑하고 null 합계를 0으로 채운다', async () => {
		daily_report.groupBy.mockResolvedValue([
			// 모든 필드에 값이 있는 행
			{ view_code: 'vc1', pub_id: 'pub', sub_id: 'sub', _sum: { click: 1, install: 2, registration: 3, retention: 4, purchase: 5, revenue: 6, etc1: 7, etc2: 8, etc3: 9, etc4: 10, etc5: 11, unregistered: 12 } },
			// 모든 필드가 null인 행(전부 0으로 채워져야 함)
			{ view_code: 'vc2', pub_id: null, sub_id: null, _sum: { click: null, install: null, registration: null, retention: null, purchase: null, revenue: null, etc1: null, etc2: null, etc3: null, etc4: null, etc5: null, unregistered: null } },
		]);

		const result = await repository.dailyDetail({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 'tok', { field: 'install', order: 'desc' });

		expect(result[0]).toEqual({
			view_code: 'vc1', pub_id: 'pub', sub_id: 'sub',
			click: 1, install: 2, registration: 3, retention: 4, purchase: 5, revenue: 6,
			etc1: 7, etc2: 8, etc3: 9, etc4: 10, etc5: 11,
		});
		expect(result[1]).toEqual({
			view_code: 'vc2', pub_id: null, sub_id: null,
			click: 0, install: 0, registration: 0, retention: 0, purchase: 0, revenue: 0,
			etc1: 0, etc2: 0, etc3: 0, etc4: 0, etc5: 0,
		});
		expect(daily_report.groupBy).toHaveBeenCalledWith(
			expect.objectContaining({
				by: ['view_code', 'pub_id', 'sub_id'],
				where: expect.objectContaining({ token: 'tok' }),
				orderBy: { _sum: { install: 'desc' } },
			})
		);
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
		expect(call.where.campaign).toBeUndefined();
	});

	// token 생략 시 전체 합산이 되므로, 이 중첩 필터가 없으면 허용 목록 밖 데이터가 그대로 샌다
	it('daily는 token이 없어도 허용 목록으로 campaign을 중첩 필터한다', async () => {
		daily_report.groupBy.mockResolvedValue([]);

		await repository.daily({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, undefined, [1, 2]);

		const call = daily_report.groupBy.mock.calls[0][0];
		expect(call.where.campaign).toEqual({ advertising_id: { in: [1, 2] } });
	});

	// Prisma의 in: []은 IN ()을 만들지 않고 항상 거짓인 조건이 되어 0행을 반환한다
	it('daily는 허용 목록이 비면 빈 in 필터를 그대로 넘긴다', async () => {
		daily_report.groupBy.mockResolvedValue([]);

		await repository.daily({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 'tok', []);

		expect(daily_report.groupBy.mock.calls[0][0].where.campaign).toEqual({ advertising_id: { in: [] } });
	});

	// 남의 token을 넣어도 campaign의 advertising이 스코프 밖이면 0행이다(= token 소유권 검증)
	it('dailyDetail은 허용 목록으로 campaign을 중첩 필터한다', async () => {
		daily_report.groupBy.mockResolvedValue([]);

		await repository.dailyDetail({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 'tok', { field: 'install', order: 'desc' }, [1]);

		const call = daily_report.groupBy.mock.calls[0][0];
		expect(call.where.campaign).toEqual({ advertising_id: { in: [1] } });
	});

	it('dailyDetail은 스코프가 없으면 중첩 필터를 붙이지 않는다', async () => {
		daily_report.groupBy.mockResolvedValue([]);

		await repository.dailyDetail({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 'tok', { field: 'install', order: 'desc' });

		expect(daily_report.groupBy.mock.calls[0][0].where.campaign).toBeUndefined();
	});
});
