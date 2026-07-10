// PrismaMediaRepository가 _count.campaign을 campaign 개수 필드로 매핑하는지 검증
import { PrismaMediaRepository } from './prisma-media.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaMediaRepository', () => {
	const findMany = jest.fn();
	const prisma = { media: { findMany } } as unknown as PrismaService;
	const repository = new PrismaMediaRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('_count.campaign을 campaign 개수로 매핑해 반환한다', async () => {
		findMany.mockResolvedValue([
			{ id: 1, name: 'm1', install_postback_url: 'i1', event_postback_url: 'e1', _count: { campaign: 3 } },
			{ id: 2, name: 'm2', install_postback_url: 'i2', event_postback_url: 'e2', _count: { campaign: 0 } },
		]);

		const result = await repository.findAllWithCampaignCount();

		expect(findMany).toHaveBeenCalledWith({ include: { _count: { select: { campaign: true } } } });
		expect(result).toEqual([
			{ id: 1, name: 'm1', install_postback_url: 'i1', event_postback_url: 'e1', campaign: 3 },
			{ id: 2, name: 'm2', install_postback_url: 'i2', event_postback_url: 'e2', campaign: 0 },
		]);
	});

	it('media가 없으면 빈 배열을 반환한다', async () => {
		findMany.mockResolvedValue([]);
		expect(await repository.findAllWithCampaignCount()).toEqual([]);
	});
});
