// PrismaAdvertiserRepository가 조회·생성을 Prisma에 위임하는지 검증
import { PrismaAdvertiserRepository } from './prisma-advertiser.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaAdvertiserRepository', () => {
	const findMany = jest.fn();
	const findUnique = jest.fn();
	const create = jest.fn();
	const prisma = { advertiser: { findMany, findUnique, create } } as unknown as PrismaService;
	const repository = new PrismaAdvertiserRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('findAll은 전체 목록을 반환한다', async () => {
		const list = [{ id: 1, name: 'a' }];
		findMany.mockResolvedValue(list);

		expect(await repository.findAll()).toBe(list);
		expect(findMany).toHaveBeenCalledWith();
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
});
