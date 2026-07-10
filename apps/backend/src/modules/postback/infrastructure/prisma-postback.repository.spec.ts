// PrismaPostbackRepository가 postback 배열을 createMany로 저장하는지 검증
import { PrismaPostbackRepository } from './prisma-postback.repository';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Postback } from '@postback/domain/postback.entity';

describe('PrismaPostbackRepository', () => {
	const createMany = jest.fn();
	const prisma = { postback: { createMany } } as unknown as PrismaService;
	const repository = new PrismaPostbackRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('postback 배열을 data로 넘겨 createMany를 호출한다', async () => {
		const postbacks = [{ token: 'token-1' }, { token: 'token-2' }] as unknown as Postback[];
		createMany.mockResolvedValue({ count: 2 });

		await repository.createMany(postbacks);

		expect(createMany).toHaveBeenCalledWith({ data: postbacks });
	});
});
