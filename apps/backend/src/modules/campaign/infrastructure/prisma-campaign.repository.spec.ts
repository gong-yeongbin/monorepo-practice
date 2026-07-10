// PrismaCampaignRepository의 조회·생성·삭제·토글·config 교체를 검증
import { PrismaCampaignRepository } from './prisma-campaign.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaCampaignRepository', () => {
	const campaign = { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn(), update: jest.fn() };
	const advertising = { findUnique: jest.fn() };
	const media = { findUnique: jest.fn() };
	const campaign_config = { findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() };
	const $transaction = jest.fn();
	const prisma = { campaign, advertising, media, campaign_config, $transaction } as unknown as PrismaService;
	const repository = new PrismaCampaignRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('findById는 id로 조회한다', async () => {
		const found = { id: 1 };
		campaign.findUnique.mockResolvedValue(found);

		expect(await repository.findById(1)).toBe(found);
		expect(campaign.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
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

	it('setActive는 is_active를 갱신한다', async () => {
		await repository.setActive(10, false);
		expect(campaign.update).toHaveBeenCalledWith({ where: { id: 10 }, data: { is_active: false } });
	});

	it('findConfigs는 campaign_id로 config 목록을 조회한다', async () => {
		const configs = [{ id: 1 }];
		campaign_config.findMany.mockResolvedValue(configs);

		expect(await repository.findConfigs(10)).toBe(configs);
		expect(campaign_config.findMany).toHaveBeenCalledWith({ where: { campaign_id: 10 } });
	});

	it('replaceConfigs는 deleteMany·createMany를 하나의 트랜잭션으로 실행한다', async () => {
		campaign_config.deleteMany.mockReturnValue('DELETE_OP');
		campaign_config.createMany.mockReturnValue('CREATE_OP');
		const configs = [{ send_media: true, tracker_event_name: 'install', admin_event_name: 'install', media_event_name: 'install' }];

		await repository.replaceConfigs(10, configs);

		expect(campaign_config.deleteMany).toHaveBeenCalledWith({ where: { campaign_id: 10 } });
		expect(campaign_config.createMany).toHaveBeenCalledWith({ data: [{ ...configs[0], campaign_id: 10 }] });
		expect($transaction).toHaveBeenCalledWith(['DELETE_OP', 'CREATE_OP']);
	});
});
