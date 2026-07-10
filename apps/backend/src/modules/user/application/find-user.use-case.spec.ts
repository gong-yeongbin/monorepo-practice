import { Test } from '@nestjs/testing';
import { FindUserUseCase } from './find-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

describe('FindUserUseCase', () => {
	const userRepository = { findByUserId: jest.fn(), create: jest.fn() };
	let useCase: FindUserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [FindUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();

		useCase = module.get(FindUserUseCase);
	});

	it('user_id로 조회 결과를 그대로 반환한다', async () => {
		const user = { id: 1, user_id: 'admin', password: 'hashed', role: 'ADMIN' };
		userRepository.findByUserId.mockResolvedValue(user);

		expect(await useCase.execute('admin')).toBe(user);
		expect(userRepository.findByUserId).toHaveBeenCalledWith('admin');
	});

	it('없으면 null을 반환한다', async () => {
		userRepository.findByUserId.mockResolvedValue(null);
		expect(await useCase.execute('none')).toBeNull();
	});
});
