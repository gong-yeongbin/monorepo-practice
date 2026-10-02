// PrismaLoginHistoryRepository가 생성·목록 조회를 Prisma에 위임하고, user_agent를 컬럼 길이에 맞춰 자르는지 검증
import { PrismaLoginHistoryRepository } from './prisma-login-history.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaLoginHistoryRepository', () => {
	const create = jest.fn();
	const findMany = jest.fn();
	const count = jest.fn();
	const prismaService = { login_history: { create, findMany, count } } as unknown as PrismaService;
	const repository = new PrismaLoginHistoryRepository(prismaService);

	const props = { user_id: 1, email: 'user@example.com', result: 'SUCCESS' as const, ip: '203.0.113.10', user_agent: 'Mozilla/5.0' };
	const row = { id: 1, ...props, created_at: new Date('2026-10-02T00:00:00Z') };

	beforeEach(() => jest.clearAllMocks());

	it('전달받은 props로 기록을 생성한다', async () => {
		await repository.create(props);
		expect(create).toHaveBeenCalledWith({ data: props });
	});

	// user_agent 컬럼은 VarChar(512) — 비정상적으로 긴 헤더 때문에 로그인 자체가 실패하면 안 된다
	it('user_agent가 512자를 넘으면 잘라서 저장한다', async () => {
		await repository.create({ ...props, user_agent: 'a'.repeat(600) });
		expect(create).toHaveBeenCalledWith({ data: { ...props, user_agent: 'a'.repeat(512) } });
	});

	it('user_agent가 null이면 null 그대로 저장한다', async () => {
		await repository.create({ ...props, user_agent: null });
		expect(create).toHaveBeenCalledWith({ data: { ...props, user_agent: null } });
	});

	// created_at은 초 단위(Timestamp(0))라 같은 초의 기록은 id로 순서를 보장한다
	it('list는 최신순(created_at, 동률이면 id)으로 offset·limit만큼 조회하고 전체 건수를 함께 반환한다', async () => {
		findMany.mockResolvedValue([row]);
		count.mockResolvedValue(1);

		expect(await repository.list({ offset: 0, limit: 20 })).toEqual({ items: [row], total: 1 });
		// user_id가 undefined면 조건이 무시되어 전체가 조회된다
		expect(findMany).toHaveBeenCalledWith({ where: { user_id: undefined }, orderBy: [{ created_at: 'desc' }, { id: 'desc' }], skip: 0, take: 20 });
		expect(count).toHaveBeenCalledWith({ where: { user_id: undefined } });
	});

	it('list는 user_id를 주면 where로 넘긴다', async () => {
		findMany.mockResolvedValue([]);
		count.mockResolvedValue(0);

		await repository.list({ user_id: 1, offset: 20, limit: 10 });

		expect(findMany).toHaveBeenCalledWith({ where: { user_id: 1 }, orderBy: [{ created_at: 'desc' }, { id: 'desc' }], skip: 20, take: 10 });
		expect(count).toHaveBeenCalledWith({ where: { user_id: 1 } });
	});
});
