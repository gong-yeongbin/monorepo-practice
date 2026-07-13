// PrismaAdvertisingRepository의 CRUD 매핑·파생 status를 검증
import { PrismaAdvertisingRepository } from './prisma-advertising.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaAdvertisingRepository', () => {
	const advertising = { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() };
	const tracker = { findUnique: jest.fn() };
	const advertiser = { findUnique: jest.fn() };
	const campaign = { count: jest.fn() };
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

	it('update는 id와 props로 수정하고, delete는 id로 삭제한다', async () => {
		const props = { name: 'a', image: null, advertiser_id: 1, tracker_id: 2 };
		advertising.update.mockResolvedValue({ id: 1, ...props });
		expect(await repository.update(1, props)).toEqual({ id: 1, ...props });
		expect(advertising.update).toHaveBeenCalledWith({ where: { id: 1 }, data: props });

		await repository.delete(1);
		expect(advertising.delete).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('list는 tracker명을 싣고 활성 campaign 개수를 세어 1개 이상이면 status=true로 매핑한다', async () => {
		advertising.findMany.mockResolvedValue([
			{ id: 1, name: 'a', image: 'img', advertiser_id: 1, tracker_id: 2, tracker: { name: 'appsflyer' }, _count: { campaign: 2 } },
			{ id: 2, name: 'b', image: null, advertiser_id: 1, tracker_id: 2, tracker: { name: 'adjust' }, _count: { campaign: 0 } },
		]);

		const result = await repository.list({ search: 'a', offset: 0, limit: 20 });

		expect(result).toEqual([
			{ id: 1, name: 'a', image: 'img', advertiser_id: 1, tracker_id: 2, tracker: 'appsflyer', campaign: 2, status: true },
			{ id: 2, name: 'b', image: null, advertiser_id: 1, tracker_id: 2, tracker: 'adjust', campaign: 0, status: false },
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

	it('get은 연결된 media를 중복 없이 모아 반환한다', async () => {
		advertising.findUnique.mockResolvedValue({
			id: 1,
			name: 'ad',
			image: 'img',
			advertiser: { name: 'adv' },
			tracker: { name: 'trk' },
			campaign: [{ media: { name: 'm1' } }, { media: { name: 'm1' } }, { media: { name: 'm2' } }],
		});

		const result = await repository.get(1);

		expect(result).toEqual({ advertiser: 'adv', tracker: 'trk', advertising: 'ad', image: 'img', media: ['m1', 'm2'] });
	});

	it('get은 advertising이 없으면 null을 반환한다', async () => {
		advertising.findUnique.mockResolvedValue(null);
		expect(await repository.get(1)).toBeNull();
	});

	it('countCampaign은 advertising_id로 campaign 개수를 센다', async () => {
		campaign.count.mockResolvedValue(3);
		expect(await repository.countCampaign(1)).toBe(3);
		expect(campaign.count).toHaveBeenCalledWith({ where: { advertising_id: 1 } });
	});
});
