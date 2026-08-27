import { Test } from '@nestjs/testing';
import { ListUserUseCase } from './list-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

describe('ListUserUseCase', () => {
	const userRepository = { findAll: jest.fn() };
	let useCase: ListUserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [ListUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();
		useCase = module.get(ListUserUseCase);
	});

	it('user 전체 목록을 반환한다', async () => {
		const list = [
			{ id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true },
			{ id: 2, email: 'viewer@example.com', role: 'USER', approved: false },
		];
		userRepository.findAll.mockResolvedValue(list);

		expect(await useCase.execute()).toBe(list);
		expect(userRepository.findAll).toHaveBeenCalledWith(undefined);
	});

	it('승인 여부 필터를 repository에 그대로 넘긴다', async () => {
		const list = [{ id: 2, email: 'viewer@example.com', role: 'USER', approved: false }];
		userRepository.findAll.mockResolvedValue(list);

		expect(await useCase.execute({ approved: false })).toBe(list);
		expect(userRepository.findAll).toHaveBeenCalledWith({ approved: false });
	});
});
