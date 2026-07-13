// PrismaMediaRepository가 CRUD와 _count.campaign 매핑을 Prisma에 위임하는지 검증
import { PrismaMediaRepository } from './prisma-media.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaMediaRepository', () => {
	const findMany = jest.fn();
	const findUnique = jest.fn();
	const create = jest.fn();
	const update = jest.fn();
	const del = jest.fn();
	const count = jest.fn();
	const prisma = { media: { findMany, findUnique, create, update, delete: del }, campaign: { count } } as unknown as PrismaService;
	const repository = new PrismaMediaRepository(prisma);

	const props = { name: 'm1', install_postback_url: 'i', event_postback_url: 'e' };

	beforeEach(() => jest.clearAllMocks());

	it('_count.campaign을 campaign 개수로 매핑해 반환한다', async () => {
		findMany.mockResolvedValue([
			{ id: 1, name: 'm1', install_postback_url: 'i1', event_postback_url: 'e1', _count: { campaign: 3 } },
			{ id: 2, name: 'm2', install_postback_url: 'i2', event_postback_url: 'e2', _count: { campaign: 0 } },
		]);

		const result = await repository.findAllWithCampaignCount();

		expect(findMany).toHaveBeenCalledWith({ include: { _count: { select: { campaign: true } } } });
		expect(result).toEqual([
			{ id: 1, name: 'm1', install_postback_url: 'i1', event_postback_url: 'e1', campaign: 3 },
			{ id: 2, name: 'm2', install_postback_url: 'i2', event_postback_url: 'e2', campaign: 0 },
		]);
	});

	it('media가 없으면 빈 배열을 반환한다', async () => {
		findMany.mockResolvedValue([]);
		expect(await repository.findAllWithCampaignCount()).toEqual([]);
	});

	it('findById는 id로 조회한다', async () => {
		const row = { id: 1, ...props };
		findUnique.mockResolvedValue(row);

		expect(await repository.findById(1)).toBe(row);
		expect(findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('findByName은 name으로 조회한다', async () => {
		const row = { id: 1, ...props };
		findUnique.mockResolvedValue(row);

		expect(await repository.findByName('m1')).toBe(row);
		expect(findUnique).toHaveBeenCalledWith({ where: { name: 'm1' } });
	});

	it('create는 props로 생성한다', async () => {
		const created = { id: 5, ...props };
		create.mockResolvedValue(created);

		expect(await repository.create(props)).toBe(created);
		expect(create).toHaveBeenCalledWith({ data: props });
	});

	it('update는 id·props로 수정한다', async () => {
		const updated = { id: 1, ...props };
		update.mockResolvedValue(updated);

		expect(await repository.update(1, props)).toBe(updated);
		expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: props });
	});

	it('delete는 id로 삭제한다', async () => {
		await repository.delete(1);
		expect(del).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('countCampaign은 media_id로 참조 campaign 개수를 센다', async () => {
		count.mockResolvedValue(3);

		expect(await repository.countCampaign(1)).toBe(3);
		expect(count).toHaveBeenCalledWith({ where: { media_id: 1 } });
	});
});
