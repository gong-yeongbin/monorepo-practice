// PrismaConfigRepository의 campaign 존재 확인·config 조회·교체를 검증
import { PrismaConfigRepository } from './prisma-config.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaConfigRepository', () => {
	const campaign = { findUnique: jest.fn() };
	const campaign_config = { findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() };
	const $transaction = jest.fn();
	const prisma = { campaign, campaign_config, $transaction } as unknown as PrismaService;
	const repository = new PrismaConfigRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('campaignExists는 존재하면 true, 없으면 false', async () => {
		campaign.findUnique.mockResolvedValueOnce({ id: 10 });
		expect(await repository.campaignExists(10)).toBe(true);

		campaign.findUnique.mockResolvedValueOnce(null);
		expect(await repository.campaignExists(11)).toBe(false);
	});

	it('findByCampaignId는 campaign_id로 config 목록을 조회한다', async () => {
		const configs = [{ id: 1 }];
		campaign_config.findMany.mockResolvedValue(configs);

		expect(await repository.findByCampaignId(10)).toBe(configs);
		expect(campaign_config.findMany).toHaveBeenCalledWith({ where: { campaign_id: 10 } });
	});

	it('replace는 deleteMany·createMany를 하나의 트랜잭션으로 실행한다', async () => {
		campaign_config.deleteMany.mockReturnValue('DELETE_OP');
		campaign_config.createMany.mockReturnValue('CREATE_OP');
		const configs = [{ send_media: true, tracker_event_name: 'install', admin_event_name: 'install', media_event_name: 'install' }];

		await repository.replace(10, configs);

		expect(campaign_config.deleteMany).toHaveBeenCalledWith({ where: { campaign_id: 10 } });
		expect(campaign_config.createMany).toHaveBeenCalledWith({ data: [{ ...configs[0], campaign_id: 10 }] });
		expect($transaction).toHaveBeenCalledWith(['DELETE_OP', 'CREATE_OP']);
	});
});
