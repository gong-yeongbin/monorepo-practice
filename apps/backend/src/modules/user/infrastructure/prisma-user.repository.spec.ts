// PrismaUserRepository가 CRUD를 Prisma에 위임하고, user_advertising 조인을 advertising_ids로 평탄화하는지 검증
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaUserRepository', () => {
	const findMany = jest.fn();
	const findUnique = jest.fn();
	const create = jest.fn();
	const update = jest.fn();
	const del = jest.fn();
	const count = jest.fn();
	const prisma = { user: { findMany, findUnique, create, update, delete: del }, advertising: { count } } as unknown as PrismaService;
	const repository = new PrismaUserRepository(prisma);

	// 조회 계열은 항상 이 include로 조인 행을 함께 읽는다
	const include = { user_advertising: { select: { advertising_id: true } } };
	// Prisma가 돌려주는 원본 행(조인 배열 형태)
	const row = { id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true, user_advertising: [{ advertising_id: 1 }, { advertising_id: 2 }] };
	// 도메인 User로 평탄화된 형태
	const user = { id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true, advertising_ids: [1, 2] };

	beforeEach(() => jest.clearAllMocks());

	it('findAll은 필터 없이 password를 제외한 전체 목록을 평탄화해 반환한다', async () => {
		findMany.mockResolvedValue([row]);

		expect(await repository.findAll()).toEqual([user]);
		// approved가 undefined면 Prisma가 조건을 무시해 전체가 조회된다
		expect(findMany).toHaveBeenCalledWith({ where: { approved: undefined }, omit: { password: true }, include });
	});

	it('findAll은 approved 필터를 where로 넘긴다', async () => {
		findMany.mockResolvedValue([{ ...row, id: 2, approved: false, user_advertising: [] }]);

		expect(await repository.findAll({ approved: false })).toEqual([{ ...user, id: 2, approved: false, advertising_ids: [] }]);
		expect(findMany).toHaveBeenCalledWith({ where: { approved: false }, omit: { password: true }, include });
	});

	it('findById는 id로 password를 제외하고 조회한다', async () => {
		findUnique.mockResolvedValue(row);

		expect(await repository.findById(1)).toEqual(user);
		expect(findUnique).toHaveBeenCalledWith({ where: { id: 1 }, omit: { password: true }, include });
	});

	it('email로 password를 제외하고 조회한다', async () => {
		findUnique.mockResolvedValue(row);

		expect(await repository.findByEmail('admin@example.com')).toEqual(user);
		expect(findUnique).toHaveBeenCalledWith({ where: { email: 'admin@example.com' }, omit: { password: true }, include });
	});

	it('없으면 null을 반환한다', async () => {
		findUnique.mockResolvedValue(null);
		expect(await repository.findByEmail('none@example.com')).toBeNull();
	});

	// signin이 여기서 얻은 advertising_ids를 access token payload에 싣는다(추가 조회 없음)
	it('findByEmailWithPassword는 password를 포함해 조회하고 허용 목록을 평탄화한다', async () => {
		findUnique.mockResolvedValue({ ...row, password: 'hashed-password' });

		expect(await repository.findByEmailWithPassword('admin@example.com')).toEqual({ ...user, password: 'hashed-password' });
		expect(findUnique).toHaveBeenCalledWith({ where: { email: 'admin@example.com' }, include });
	});

	it('전달받은 props로 user를 생성한다', async () => {
		const props = { email: 'new@example.com', password: 'hashed-password' };

		await repository.create(props);

		expect(create).toHaveBeenCalledWith({ data: props });
	});

	it('update는 id·props로 수정하고 password를 제외해 반환한다', async () => {
		update.mockResolvedValue(row);

		expect(await repository.update(1, { role: 'ADMIN', approved: true })).toEqual(user);
		expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { role: 'ADMIN', approved: true }, omit: { password: true }, include });
	});

	// user_advertising은 명시적 조인 모델이라 relation set이 없다 — deleteMany → create로 통째 교체한다
	it('update는 advertising_ids를 주면 허용 목록을 통째로 교체한다', async () => {
		update.mockResolvedValue(row);

		await repository.update(1, { approved: true, advertising_ids: [1, 2] });

		expect(update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: {
				approved: true,
				user_advertising: { deleteMany: {}, create: [{ advertising_id: 1 }, { advertising_id: 2 }] },
			},
			omit: { password: true },
			include,
		});
	});

	it('update는 빈 배열을 주면 허용 목록을 전건 삭제한다', async () => {
		update.mockResolvedValue({ ...row, user_advertising: [] });

		await repository.update(1, { advertising_ids: [] });

		expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { user_advertising: { deleteMany: {}, create: [] } } }));
	});

	it('update는 advertising_ids가 없으면 허용 목록을 건드리지 않는다', async () => {
		update.mockResolvedValue(row);

		await repository.update(1, { approved: true });

		expect(update.mock.calls[0][0].data).not.toHaveProperty('user_advertising');
	});

	// 해싱은 use-case 책임이라 repository는 받은 값을 그대로 넣는다
	it('updatePassword는 id로 password만 수정한다', async () => {
		await repository.updatePassword(1, 'hashed-password');
		expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { password: 'hashed-password' } });
	});

	it('delete는 id로 삭제한다', async () => {
		await repository.delete(1);
		expect(del).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('countAdvertising은 실재하는 advertising 개수를 센다', async () => {
		count.mockResolvedValue(2);

		expect(await repository.countAdvertising([1, 2])).toBe(2);
		expect(count).toHaveBeenCalledWith({ where: { id: { in: [1, 2] } } });
	});
});
