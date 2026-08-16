// PrismaReservationRepository의 생성·조회·삭제를 검증
import { PrismaReservationRepository } from './prisma-reservation.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaReservationRepository', () => {
	const reservation = { createMany: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() };
	const campaign = { count: jest.fn() };
	const prisma = { reservation, campaign } as unknown as PrismaService;
	const repository = new PrismaReservationRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('createMany는 props 배열을 data로 넘긴다', async () => {
		const props = [{ campaign_id: 1, name: 'n', tracking_url: 'u', reserved_at: new Date() }];

		await repository.createMany(props);

		expect(reservation.createMany).toHaveBeenCalledWith({ data: props });
	});

	it('findByAdvertisingId는 관계 필터로 조회하고 campaign명·media명을 평탄화한다', async () => {
		reservation.findMany.mockResolvedValue([
			{ id: 1, campaign_id: 3, name: 'n', tracking_url: 'u', reserved_at: new Date('2026-08-20T01:00:00Z'), is_applied: false, campaign: { name: 'c1', media: { name: 'm1' } } },
		]);

		const result = await repository.findByAdvertisingId(1);

		expect(result).toEqual([
			{ id: 1, campaign_id: 3, name: 'n', tracking_url: 'u', reserved_at: new Date('2026-08-20T01:00:00Z'), is_applied: false, campaign_name: 'c1', media_name: 'm1' },
		]);
		expect(reservation.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { campaign: { advertising_id: 1 } }, orderBy: { reserved_at: 'desc' } })
		);
	});

	it('findById는 id로 단건 조회한다', async () => {
		const found = { id: 1 };
		reservation.findUnique.mockResolvedValue(found);

		expect(await repository.findById(1)).toBe(found);
		expect(reservation.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('delete는 id로 삭제한다', async () => {
		await repository.delete(1);
		expect(reservation.delete).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('countCampaigns는 id 목록으로 campaign 수를 센다', async () => {
		campaign.count.mockResolvedValue(2);

		expect(await repository.countCampaigns([1, 2])).toBe(2);
		expect(campaign.count).toHaveBeenCalledWith({ where: { id: { in: [1, 2] } } });
	});
});
