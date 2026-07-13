// PrismaAdvertisingRepository의 CRUD 매핑·파생 status를 검증
import { PrismaAdvertisingRepository } from './prisma-advertising.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaAdvertisingRepository', () => {
	const advertising = { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() };
	const tracker = { findUnique: jest.fn() };
	const advertiser = { findUnique: jest.fn() };
	const campaign = { findMany: jest.fn(), updateMany: jest.fn() };
	const prisma = { advertising, tracker, advertiser, campaign } as unknown as PrismaService;
	const repository = new PrismaAdvertisingRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

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
});
