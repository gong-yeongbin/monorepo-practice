// PrismaReservationRepository의 생성·조회·삭제를 검증
import { PrismaReservationRepository } from './prisma-reservation.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaReservationRepository', () => {
	const reservation = { createMany: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), update: jest.fn() };
	const campaign = { count: jest.fn(), update: jest.fn() };
	const $transaction = jest.fn();
	const prisma = { reservation, campaign, $transaction } as unknown as PrismaService;
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

	it('findDue는 미적용이고 예약 시각이 지난 예약을 예약 시각 오름차순으로 조회한다', async () => {
		const now = new Date('2026-08-16T01:00:00Z');
		reservation.findMany.mockResolvedValue([]);

		await repository.findDue(now);

		// 정렬이 빠지면 같은 캠페인에 밀린 예약 중 어느 것이 최종 값이 될지 정해지지 않는다
		expect(reservation.findMany).toHaveBeenCalledWith({
			where: { is_applied: false, reserved_at: { lte: now } },
			orderBy: { reserved_at: 'asc' },
			include: { campaign: { select: { token: true } } },
		});
	});

	it('findDue는 campaign token을 평탄화해 돌려준다 (use-case의 캐시 무효화용)', async () => {
		const now = new Date('2026-08-16T01:00:00Z');
		reservation.findMany.mockResolvedValue([
			{ id: 1, campaign_id: 3, name: 'a', tracking_url: 'u1', reserved_at: now, is_applied: false, campaign: { token: 'token-a' } },
		]);

		expect(await repository.findDue(now)).toEqual([
			{ id: 1, campaign_id: 3, name: 'a', tracking_url: 'u1', reserved_at: now, is_applied: false, campaign_token: 'token-a' },
		]);
	});

	it('apply는 campaign 갱신과 완료 처리를 한 트랜잭션으로 묶는다', async () => {
		const target = { id: 7, campaign_id: 3, name: '변경명', tracking_url: 'https://new', reserved_at: new Date(), is_applied: false };

		await repository.apply(target);

		expect(campaign.update).toHaveBeenCalledWith({ where: { id: 3 }, data: { name: '변경명', tracker_tracking_url: 'https://new' } });
		expect(reservation.update).toHaveBeenCalledWith({ where: { id: 7 }, data: { is_applied: true } });
		expect($transaction).toHaveBeenCalledTimes(1);
	});
});
