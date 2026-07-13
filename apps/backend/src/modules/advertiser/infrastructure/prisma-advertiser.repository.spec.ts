// PrismaAdvertiserRepository가 CRUD를 Prisma에 위임하는지 검증
import { PrismaAdvertiserRepository } from './prisma-advertiser.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaAdvertiserRepository', () => {
	const findMany = jest.fn();
	const findUnique = jest.fn();
	const create = jest.fn();
	const update = jest.fn();
	const del = jest.fn();
	const count = jest.fn();
	const prisma = { advertiser: { findMany, findUnique, create, update, delete: del }, advertising: { count } } as unknown as PrismaService;
	const repository = new PrismaAdvertiserRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('findAll은 전체 목록을 반환한다', async () => {
		const list = [{ id: 1, name: 'a' }];
		findMany.mockResolvedValue(list);

		expect(await repository.findAll()).toBe(list);
		expect(findMany).toHaveBeenCalledWith();
	});

	it('findById는 id로 조회한다', async () => {
		const advertiser = { id: 1, name: 'a' };
		findUnique.mockResolvedValue(advertiser);

		expect(await repository.findById(1)).toBe(advertiser);
		expect(findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('findByName은 name으로 조회한다', async () => {
		const advertiser = { id: 1, name: 'a' };
		findUnique.mockResolvedValue(advertiser);

		expect(await repository.findByName('a')).toBe(advertiser);
		expect(findUnique).toHaveBeenCalledWith({ where: { name: 'a' } });
	});

	it('findByName은 없으면 null을 반환한다', async () => {
		findUnique.mockResolvedValue(null);
		expect(await repository.findByName('none')).toBeNull();
	});

	it('create는 name으로 생성한다', async () => {
		const created = { id: 2, name: 'b' };
		create.mockResolvedValue(created);

		expect(await repository.create('b')).toBe(created);
		expect(create).toHaveBeenCalledWith({ data: { name: 'b' } });
	});

	it('update는 id·name으로 수정한다', async () => {
		const updated = { id: 1, name: 'c' };
		update.mockResolvedValue(updated);

		expect(await repository.update(1, 'c')).toBe(updated);
		expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'c' } });
	});

	it('delete는 id로 삭제한다', async () => {
		await repository.delete(1);
		expect(del).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('countAdvertising은 advertiser_id로 참조 advertising 개수를 센다', async () => {
		count.mockResolvedValue(3);

		expect(await repository.countAdvertising(1)).toBe(3);
		expect(count).toHaveBeenCalledWith({ where: { advertiser_id: 1 } });
	});
});
