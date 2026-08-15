// PrismaPostbackRepository의 postback 저장·로그 조회를 검증
import { PrismaPostbackRepository } from './prisma-postback.repository';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Postback } from '@postback/domain/postback.entity';

describe('PrismaPostbackRepository', () => {
	const createMany = jest.fn();
	const findMany = jest.fn();
	const groupBy = jest.fn();
	const prisma = { postback: { createMany, findMany, groupBy } } as unknown as PrismaService;
	const repository = new PrismaPostbackRepository(prisma);

	const range = { start: new Date('2026-06-30T15:00:00Z'), end: new Date('2026-07-10T15:00:00Z') };

	beforeEach(() => jest.clearAllMocks());

	it('postback 배열을 data로 넘겨 createMany를 호출한다', async () => {
		const postbacks = [{ token: 'token-1' }, { token: 'token-2' }] as unknown as Postback[];
		createMany.mockResolvedValue({ count: 2 });

		await repository.createMany(postbacks);

		expect(createMany).toHaveBeenCalledWith({ data: postbacks });
	});

	it('findInstalls는 token 필터와 installed_at 범위로 event_name=install만 조회한다', async () => {
		const rows = [{ event_name: 'install' }];
		findMany.mockResolvedValue(rows);

		expect(await repository.findInstalls({ token: 'tok', ...range })).toBe(rows);
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { event_name: 'install', token: 'tok', installed_at: { gte: range.start, lt: range.end } },
				orderBy: { installed_at: 'desc' },
			})
		);
	});

	it('findInstalls는 view_code만 주어지면 token 필터 없이 조회한다', async () => {
		findMany.mockResolvedValue([]);

		await repository.findInstalls({ view_code: 'vc1', ...range });

		const call = findMany.mock.calls[0][0];
		expect(call.where.token).toBeUndefined();
		expect(call.where.view_code).toBe('vc1');
	});

	it('findEvents는 트래커 이벤트명 목록과 evented_at 범위로 조회한다', async () => {
		const rows = [{ event_name: 'af_purchase' }];
		findMany.mockResolvedValue(rows);

		expect(await repository.findEvents({ token: 'tok', view_code: 'vc1', ...range }, ['af_purchase'])).toBe(rows);
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { event_name: { in: ['af_purchase'] }, token: 'tok', view_code: 'vc1', evented_at: { gte: range.start, lt: range.end } },
				orderBy: { evented_at: 'desc' },
			})
		);
	});

	it('countUnregistered는 등록된 이벤트명을 제외하고 이벤트명별 카운트를 매핑한다', async () => {
		groupBy.mockResolvedValue([
			{ event_name: 'af_custom', _count: { _all: 3 } },
			{ event_name: 'af_level_up', _count: { _all: 1 } },
		]);

		const result = await repository.countUnregistered('tok', ['install', 'af_purchase'], range.start, range.end);

		expect(result).toEqual([
			{ event_name: 'af_custom', count: 3 },
			{ event_name: 'af_level_up', count: 1 },
		]);
		expect(groupBy).toHaveBeenCalledWith(
			expect.objectContaining({
				by: ['event_name'],
				where: { token: 'tok', event_name: { notIn: ['install', 'af_purchase'] }, evented_at: { gte: range.start, lt: range.end } },
			})
		);
	});
});
