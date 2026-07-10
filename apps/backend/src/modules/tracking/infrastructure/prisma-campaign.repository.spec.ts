// PrismaCampaignRepository가 token으로 campaign_config를 include해 조회하는지 검증
import { PrismaCampaignRepository } from './prisma-campaign.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaCampaignRepository (tracking)', () => {
	const findUnique = jest.fn();
	const prisma = { campaign: { findUnique } } as unknown as PrismaService;
	const repository = new PrismaCampaignRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('token으로 campaign_config를 include해 조회한다', async () => {
		const campaign = { token: 'token-1', campaign_config: [] };
		findUnique.mockResolvedValue(campaign);

		const result = await repository.findByToken('token-1');

		expect(result).toBe(campaign);
		expect(findUnique).toHaveBeenCalledWith({ where: { token: 'token-1' }, include: { campaign_config: true } });
	});

	it('없으면 null을 반환한다', async () => {
		findUnique.mockResolvedValue(null);
		expect(await repository.findByToken('none')).toBeNull();
	});
});
