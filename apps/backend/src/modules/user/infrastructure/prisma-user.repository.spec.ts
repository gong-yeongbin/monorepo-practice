// PrismaUserRepository가 CRUD를 Prisma에 위임하는지 검증
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaUserRepository', () => {
	const findMany = jest.fn();
	const findUnique = jest.fn();
	const create = jest.fn();
	const update = jest.fn();
	const del = jest.fn();
	const prisma = { user: { findMany, findUnique, create, update, delete: del } } as unknown as PrismaService;
	const repository = new PrismaUserRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('findAll은 전체 목록을 반환한다', async () => {
		const list = [{ id: 1, user_id: 'admin', password: 'hashed', role: 'ADMIN' }];
		findMany.mockResolvedValue(list);

		expect(await repository.findAll()).toBe(list);
		expect(findMany).toHaveBeenCalledWith();
	});

	it('findById는 id로 조회한다', async () => {
		const user = { id: 1, user_id: 'admin', password: 'hashed', role: 'ADMIN' };
		findUnique.mockResolvedValue(user);

		expect(await repository.findById(1)).toBe(user);
		expect(findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
	});

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

	it('update는 id·props로 수정한다', async () => {
		const updated = { id: 1, user_id: 'admin', password: 'new', role: 'MEDIA' };
		update.mockResolvedValue(updated);

		expect(await repository.update(1, { password: 'new', role: 'MEDIA' })).toBe(updated);
		expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { password: 'new', role: 'MEDIA' } });
	});

	it('delete는 id로 삭제한다', async () => {
		await repository.delete(1);
		expect(del).toHaveBeenCalledWith({ where: { id: 1 } });
	});
});
