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

	it('findAll은 password를 제외한 전체 목록을 반환한다', async () => {
		const list = [{ id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true }];
		findMany.mockResolvedValue(list);

		expect(await repository.findAll()).toBe(list);
		expect(findMany).toHaveBeenCalledWith({ omit: { password: true } });
	});

	it('findById는 id로 password를 제외하고 조회한다', async () => {
		const user = { id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true };
		findUnique.mockResolvedValue(user);

		expect(await repository.findById(1)).toBe(user);
		expect(findUnique).toHaveBeenCalledWith({ where: { id: 1 }, omit: { password: true } });
	});

	it('email로 password를 제외하고 조회한다', async () => {
		const user = { id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true };
		findUnique.mockResolvedValue(user);

		const result = await repository.findByEmail('admin@example.com');

		expect(result).toBe(user);
		expect(findUnique).toHaveBeenCalledWith({ where: { email: 'admin@example.com' }, omit: { password: true } });
	});

	it('없으면 null을 반환한다', async () => {
		findUnique.mockResolvedValue(null);
		expect(await repository.findByEmail('none@example.com')).toBeNull();
	});

	it('전달받은 props로 user를 생성한다', async () => {
		const props = { email: 'new@example.com', password: 'hashed-password' };

		await repository.create(props);

		expect(create).toHaveBeenCalledWith({ data: props });
	});

	it('update는 id·props로 수정하고 password를 제외해 반환한다', async () => {
		const updated = { id: 1, email: 'admin@example.com', role: 'MEDIA', approved: true };
		update.mockResolvedValue(updated);

		expect(await repository.update(1, { role: 'MEDIA', approved: true })).toBe(updated);
		expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { role: 'MEDIA', approved: true }, omit: { password: true } });
	});

	it('delete는 id로 삭제한다', async () => {
		await repository.delete(1);
		expect(del).toHaveBeenCalledWith({ where: { id: 1 } });
	});
});
