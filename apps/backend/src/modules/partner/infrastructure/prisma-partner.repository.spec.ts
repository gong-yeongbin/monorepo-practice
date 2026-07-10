// PrismaPartnerRepository가 media/advertiser 기준 집계를 $queryRaw로 실행하는지 검증
import { PrismaPartnerRepository } from './prisma-partner.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaPartnerRepository', () => {
	const $queryRaw = jest.fn();
	const prisma = { $queryRaw } as unknown as PrismaService;
	const repository = new PrismaPartnerRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('statsByMedia는 $queryRaw 결과를 반환한다', async () => {
		const rows = [{ advertising_id: 1, advertising_name: 'a', click: 10 }];
		$queryRaw.mockResolvedValue(rows);

		expect(await repository.statsByMedia(2, new Date('2026-07-10'))).toBe(rows);
		expect($queryRaw).toHaveBeenCalled();
	});

	it('statsByAdvertiser는 $queryRaw 결과를 반환한다', async () => {
		const rows = [{ advertising_id: 3, advertising_name: 'b', click: 5 }];
		$queryRaw.mockResolvedValue(rows);

		expect(await repository.statsByAdvertiser(4, new Date('2026-07-10'))).toBe(rows);
		expect($queryRaw).toHaveBeenCalled();
	});
});
