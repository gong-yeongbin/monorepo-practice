// PrismaTrackerRepository가 tracker CRUD를 Prisma로 처리하는지 검증
import { PrismaTrackerRepository } from './prisma-tracker.repository';
import { PrismaService } from '@infra/prisma/prisma.service';

describe('PrismaTrackerRepository', () => {
	const tracker = { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() };
	const advertising = { count: jest.fn() };
	const prisma = { tracker, advertising } as unknown as PrismaService;
	const repository = new PrismaTrackerRepository(prisma);

	const props = { name: 'appsflyer', tracking_url: 't', install_postback_url: 'i', event_postback_url: 'e' };

	beforeEach(() => jest.clearAllMocks());

	it('findAll은 전체 tracker 목록을 반환한다', async () => {
		const list = [{ id: 1, ...props }];
		tracker.findMany.mockResolvedValue(list);

		expect(await repository.findAll()).toBe(list);
		expect(tracker.findMany).toHaveBeenCalledWith();
	});

	it('findById는 id로 조회한다', async () => {
		const row = { id: 1, ...props };
		tracker.findUnique.mockResolvedValue(row);

		expect(await repository.findById(1)).toBe(row);
		expect(tracker.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('findByName은 name으로 조회한다', async () => {
		const row = { id: 1, ...props };
		tracker.findUnique.mockResolvedValue(row);

		expect(await repository.findByName('appsflyer')).toBe(row);
		expect(tracker.findUnique).toHaveBeenCalledWith({ where: { name: 'appsflyer' } });
	});

	it('create는 props로 생성한다', async () => {
		const created = { id: 5, ...props };
		tracker.create.mockResolvedValue(created);

		expect(await repository.create(props)).toBe(created);
		expect(tracker.create).toHaveBeenCalledWith({ data: props });
	});

	it('update는 id·props로 수정한다', async () => {
		const updated = { id: 1, ...props };
		tracker.update.mockResolvedValue(updated);

		expect(await repository.update(1, props)).toBe(updated);
		expect(tracker.update).toHaveBeenCalledWith({ where: { id: 1 }, data: props });
	});

	it('delete는 id로 삭제한다', async () => {
		await repository.delete(1);
		expect(tracker.delete).toHaveBeenCalledWith({ where: { id: 1 } });
	});

	it('countAdvertising은 tracker_id로 참조 advertising 개수를 센다', async () => {
		advertising.count.mockResolvedValue(3);

		expect(await repository.countAdvertising(1)).toBe(3);
		expect(advertising.count).toHaveBeenCalledWith({ where: { tracker_id: 1 } });
	});
});
