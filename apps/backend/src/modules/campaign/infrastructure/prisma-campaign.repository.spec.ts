// PrismaCampaignRepository의 조회·생성·수정·삭제를 검증
import { PrismaCampaignRepository } from './prisma-campaign.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaCampaignRepository', () => {
	const campaign = { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn(), update: jest.fn() };
	const advertising = { findUnique: jest.fn() };
	const media = { findUnique: jest.fn() };
	const prisma = { campaign, advertising, media } as unknown as PrismaService;
	const repository = new PrismaCampaignRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('findById는 id로 조회한다', async () => {
		const found = { id: 1 };
		campaign.findUnique.mockResolvedValue(found);

		expect(await repository.findById(1)).toBe(found);
		expect(campaign.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('findByAdvertisingId는 media명을 평탄화해 매핑한다', async () => {
		campaign.findMany.mockResolvedValue([{ id: 3, token: 'tok', name: 'c', type: 'CPI', is_active: true, media: { name: 'm1' } }]);

		const result = await repository.findByAdvertisingId(1);

		expect(result).toEqual([{ campaign_id: 3, token: 'tok', campaign_name: 'c', type: 'CPI', is_active: true, media_name: 'm1' }]);
		expect(campaign.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { advertising_id: 1 }, orderBy: { id: 'desc' } }));
	});

	it('findAdvertisingTracker는 advertising의 tracker 정보를 매핑한다', async () => {
		advertising.findUnique.mockResolvedValue({ id: 5, tracker: { name: 'appsflyer', tracking_url: 'https://t' } });

		const result = await repository.findAdvertisingTracker(5);

		expect(result).toEqual({ tracker_name: 'appsflyer', tracker_tracking_url: 'https://t' });
		expect(advertising.findUnique).toHaveBeenCalledWith({ where: { id: 5 }, include: { tracker: true } });
	});

	it('findAdvertisingTracker는 advertising이 없으면 null을 반환한다', async () => {
		advertising.findUnique.mockResolvedValue(null);
		expect(await repository.findAdvertisingTracker(5)).toBeNull();
	});

	it('mediaExists는 존재하면 true, 없으면 false', async () => {
		media.findUnique.mockResolvedValueOnce({ id: 2 });
		expect(await repository.mediaExists(2)).toBe(true);

		media.findUnique.mockResolvedValueOnce(null);
		expect(await repository.mediaExists(3)).toBe(false);
	});

	it('create는 기본 config와 함께 campaign을 생성한다', async () => {
		const created = { id: 10 };
		campaign.create.mockResolvedValue(created);
		const props = { name: 'c', type: 'CPI' as const, advertising_id: 5, media_id: 2, tracker_name: 'appsflyer', tracker_tracking_url: 'https://t' };

		expect(await repository.create(props)).toBe(created);
		expect(campaign.create).toHaveBeenCalledWith({ data: { ...props, campaign_config: { create: {} } } });
	});

	it('delete는 id로 삭제한다', async () => {
		await repository.delete(10);
		expect(campaign.delete).toHaveBeenCalledWith({ where: { id: 10 } });
	});

	it('update는 전달된 필드로 갱신하고 결과를 반환한다', async () => {
		const updated = { id: 10, name: 'new' };
		campaign.update.mockResolvedValue(updated);
		const props = { name: 'new', is_active: false };

		expect(await repository.update(10, props)).toBe(updated);
		expect(campaign.update).toHaveBeenCalledWith({ where: { id: 10 }, data: props });
	});
});
