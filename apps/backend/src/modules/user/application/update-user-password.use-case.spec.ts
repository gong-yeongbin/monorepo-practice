// 비밀번호를 해시해 저장하고, 없는 user는 404로 거르는지 검증
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserPasswordUseCase } from './update-user-password.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

jest.mock('bcrypt', () => ({ hash: jest.fn() }));

describe('UpdateUserPasswordUseCase', () => {
	const userRepository = { findById: jest.fn(), updatePassword: jest.fn() };
	let useCase: UpdateUserPasswordUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [UpdateUserPasswordUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();
		useCase = module.get(UpdateUserPasswordUseCase);
	});

	it('존재하면 새 비밀번호를 해시해 저장한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, email: 'admin@example.com' });
		(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

		await useCase.execute(1, { password: 'password1234' });

		expect(bcrypt.hash).toHaveBeenCalledWith('password1234', 10);
		// 평문이 아니라 해시가 저장되어야 한다
		expect(userRepository.updatePassword).toHaveBeenCalledWith(1, 'hashed-password');
	});

	it('존재하지 않으면 NotFoundException을 던지고 해시도 하지 않는다', async () => {
		userRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1, { password: 'password1234' })).rejects.toThrow(NotFoundException);
		expect(bcrypt.hash).not.toHaveBeenCalled();
		expect(userRepository.updatePassword).not.toHaveBeenCalled();
	});
});
