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

	it('password를 제외한 프로필 목록을 반환한다', async () => {
		userRepository.findAll.mockResolvedValue([
			{ id: 1, user_id: 'admin', password: 'secret', role: 'ADMIN' },
			{ id: 2, user_id: 'adv', password: 'secret2', role: 'ADVERTISER' },
		]);

		expect(await useCase.execute()).toEqual([
			{ id: 1, user_id: 'admin', role: 'ADMIN' },
			{ id: 2, user_id: 'adv', role: 'ADVERTISER' },
		]);
	});
});
