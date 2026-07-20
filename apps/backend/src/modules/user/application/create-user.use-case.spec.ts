import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

describe('CreateUserUseCase', () => {
	const userRepository = { findByEmail: jest.fn(), create: jest.fn() };
	let useCase: CreateUserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [CreateUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();

		useCase = module.get(CreateUserUseCase);
	});

	it('email로 user를 생성한다(role·approved는 DB 기본값)', async () => {
		userRepository.findByEmail.mockResolvedValue(null);

		await useCase.execute('new@example.com');

		expect(userRepository.create).toHaveBeenCalledWith({ email: 'new@example.com' });
	});

	it('이미 존재하는 email이면 ConflictException을 던지고 생성하지 않는다', async () => {
		userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'dup@example.com', role: 'ADMIN', approved: true });

		await expect(useCase.execute('dup@example.com')).rejects.toThrow(ConflictException);
		expect(userRepository.create).not.toHaveBeenCalled();
	});
});
