// PrismaTrackerRepository가 tracker 목록을 Prisma로 조회하는지 검증
import { PrismaTrackerRepository } from './prisma-tracker.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaTrackerRepository', () => {
	const findMany = jest.fn();
	const prisma = { tracker: { findMany } } as unknown as PrismaService;
	const repository = new PrismaTrackerRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('findAll은 전체 tracker 목록을 반환한다', async () => {
		const list = [{ id: 1, name: 'appsflyer', tracking_url: 't', install_postback_url: 'i', event_postback_url: 'e' }];
		findMany.mockResolvedValue(list);

		expect(await repository.findAll()).toBe(list);
		expect(findMany).toHaveBeenCalledWith();
	});
});
