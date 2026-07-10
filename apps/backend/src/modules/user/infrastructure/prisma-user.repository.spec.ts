// PrismaUserRepository가 user_id 조회·생성을 Prisma에 위임하는지 검증
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaUserRepository', () => {
	const findUnique = jest.fn();
	const create = jest.fn();
	const prisma = { user: { findUnique, create } } as unknown as PrismaService;
	const repository = new PrismaUserRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('user_id로 조회한다', async () => {
		const user = { id: 1, user_id: 'admin', password: 'hashed', role: 'ADMIN' };
		findUnique.mockResolvedValue(user);

		const result = await repository.findByUserId('admin');

		expect(result).toBe(user);
		expect(findUnique).toHaveBeenCalledWith({ where: { user_id: 'admin' } });
	});

	it('없으면 null을 반환한다', async () => {
		findUnique.mockResolvedValue(null);
		expect(await repository.findByUserId('none')).toBeNull();
	});

	it('전달받은 props로 user를 생성한다', async () => {
		const props = { user_id: 'admin', password: 'hashed', role: 'ADMIN' as const };

		await repository.create(props);

		expect(create).toHaveBeenCalledWith({ data: props });
	});
});
