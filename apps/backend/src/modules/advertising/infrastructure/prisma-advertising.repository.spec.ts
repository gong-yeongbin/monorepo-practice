// PrismaAdvertisingRepository의 CRUD 매핑·파생 status·통계 집계를 검증
import { PrismaAdvertisingRepository } from './prisma-advertising.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaAdvertisingRepository', () => {
	const advertising = { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() };
	const tracker = { findUnique: jest.fn() };
	const advertiser = { findUnique: jest.fn() };
	const campaign = { findMany: jest.fn(), updateMany: jest.fn() };
	const daily_report = { groupBy: jest.fn() };
	const $queryRaw = jest.fn();
	const prisma = { advertising, tracker, advertiser, campaign, daily_report, $queryRaw } as unknown as PrismaService;
	const repository = new PrismaAdvertisingRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	// ── CRUD ──

	it('exists/trackerExists/advertiserExists는 존재 여부를 boolean으로 반환한다', async () => {
		advertising.findUnique.mockResolvedValueOnce({ id: 1 });
		expect(await repository.exists(1)).toBe(true);
		advertising.findUnique.mockResolvedValueOnce(null);
		expect(await repository.exists(1)).toBe(false);

		tracker.findUnique.mockResolvedValueOnce({ id: 1 });
		expect(await repository.trackerExists(1)).toBe(true);
		tracker.findUnique.mockResolvedValueOnce(null);
		expect(await repository.trackerExists(1)).toBe(false);

		advertiser.findUnique.mockResolvedValueOnce({ id: 1 });
		expect(await repository.advertiserExists(1)).toBe(true);
		advertiser.findUnique.mockResolvedValueOnce(null);
		expect(await repository.advertiserExists(1)).toBe(false);
	});

	it('findByName은 name으로 조회하고, create는 props로 생성한다', async () => {
		advertising.findUnique.mockResolvedValue({ id: 1, name: 'a' });
		expect(await repository.findByName('a')).toEqual({ id: 1, name: 'a' });
		expect(advertising.findUnique).toHaveBeenCalledWith({ where: { name: 'a' } });

		const props = { name: 'a', image: null, advertiser_id: 1, tracker_id: 2 };
		advertising.create.mockResolvedValue({ id: 5, ...props });
		expect(await repository.create(props)).toEqual({ id: 5, ...props });
		expect(advertising.create).toHaveBeenCalledWith({ data: props });
	});

	it('list는 활성 campaign 개수를 세고 1개 이상이면 status=true로 매핑한다', async () => {
		advertising.findMany.mockResolvedValue([
			{ id: 1, name: 'a', image: 'img', advertiser_id: 1, tracker_id: 2, _count: { campaign: 2 } },
			{ id: 2, name: 'b', image: null, advertiser_id: 1, tracker_id: 2, _count: { campaign: 0 } },
		]);

		const result = await repository.list({ search: 'a', offset: 0, limit: 20 });

		expect(result).toEqual([
			{ id: 1, name: 'a', image: 'img', advertiser_id: 1, tracker_id: 2, campaign: 2, status: true },
			{ id: 2, name: 'b', image: null, advertiser_id: 1, tracker_id: 2, campaign: 0, status: false },
		]);
		expect(advertising.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { name: { contains: 'a' } },
				orderBy: { id: 'desc' },
				skip: 0,
				take: 20,
			})
		);
	});

	it('brief는 tracker명을 평탄화해 매핑한다', async () => {
		advertising.findMany.mockResolvedValue([{ id: 1, name: 'a', image: 'img', tracker: { name: 'appsflyer' } }]);

		expect(await repository.brief()).toEqual([{ id: 1, name: 'a', image: 'img', tracker: 'appsflyer' }]);
	});

	it('info는 연결된 media를 중복 없이 모아 반환한다', async () => {
		advertising.findUnique.mockResolvedValue({
			id: 1,
			name: 'ad',
			image: 'img',
			advertiser: { name: 'adv' },
			tracker: { name: 'trk' },
			campaign: [{ media: { name: 'm1' } }, { media: { name: 'm1' } }, { media: { name: 'm2' } }],
		});

		const result = await repository.info(1);

		expect(result).toEqual({ advertiser: 'adv', tracker: 'trk', advertising: 'ad', image: 'img', media: ['m1', 'm2'] });
	});

	it('info는 advertising이 없으면 null을 반환한다', async () => {
		advertising.findUnique.mockResolvedValue(null);
		expect(await repository.info(1)).toBeNull();
	});

	it('campaignList는 media명을 평탄화해 매핑한다', async () => {
		campaign.findMany.mockResolvedValue([
			{ id: 3, token: 'tok', name: 'c', type: 'CPI', is_active: true, media: { name: 'm1' } },
		]);

		const result = await repository.campaignList(1);

		expect(result).toEqual([{ campaign_id: 3, token: 'tok', campaign_name: 'c', type: 'CPI', is_active: true, media_name: 'm1' }]);
		expect(campaign.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { advertising_id: 1 }, orderBy: { id: 'desc' } }));
	});

	it('deactivateCampaigns는 딸린 campaign을 전부 비활성화한다', async () => {
		await repository.deactivateCampaigns(1);
		expect(campaign.updateMany).toHaveBeenCalledWith({ where: { advertising_id: 1 }, data: { is_active: false } });
	});

	// ── 통계 ──

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

		const result = await repository.daily('tok', { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') });

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

	it('dailyDetail은 daily와 동일하게 token 기준 합산을 매핑한다', async () => {
		daily_report.groupBy.mockResolvedValue([
			{ created_date: new Date('2026-07-10'), _sum: { click: 3, install: 1, registration: 0, retention: 0, purchase: 0, revenue: 0, etc1: 0, etc2: 0, etc3: 0, etc4: 0, etc5: 0, unregistered: 0 } },
		]);

		const result = await repository.dailyDetail('tok', { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') });

		expect(result[0]).toEqual(expect.objectContaining({ click: 3, install: 1 }));
	});

	it('dailyDetailAll은 token 필터 없이 날짜 범위로 groupBy 합산하고 모든 카운터를 매핑한다', async () => {
		daily_report.groupBy.mockResolvedValue([
			{ created_date: new Date('2026-07-10'), _sum: { click: 1, install: 2, registration: 3, retention: 4, purchase: 5, revenue: 6, etc1: 7, etc2: 8, etc3: 9, etc4: 10, etc5: 11, unregistered: 12 } },
		]);

		const result = await repository.dailyDetailAll({ start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') });

		expect(result[0]).toEqual({
			created_date: new Date('2026-07-10'),
			click: 1, install: 2, registration: 3, retention: 4, purchase: 5, revenue: 6,
			etc1: 7, etc2: 8, etc3: 9, etc4: 10, etc5: 11, unregistered: 12,
		});
		const call = daily_report.groupBy.mock.calls[0][0];
		expect(call.where.token).toBeUndefined();
		expect(call.where.created_date).toBeDefined();
	});
});
