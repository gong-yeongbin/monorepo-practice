import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserUseCase } from './create-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';
import { CreateUserDto } from '@user/application/dto/create-user.dto';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('CreateUserUseCase', () => {
	const userRepository = { findByUserId: jest.fn(), create: jest.fn() };
	let useCase: CreateUserUseCase;

	const dto: CreateUserDto = { user_id: 'admin', password: 'pw1234', role: 'ADMIN' };

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [CreateUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();

		useCase = module.get(CreateUserUseCase);
	});

	it('신규 user_id면 비밀번호를 bcrypt로 해싱해 생성한다', async () => {
		userRepository.findByUserId.mockResolvedValue(null);
		mockedBcrypt.hash.mockResolvedValue('hashed-pw' as never);

		await useCase.execute(dto);

		expect(mockedBcrypt.hash).toHaveBeenCalledWith('pw1234', 10);
		expect(userRepository.create).toHaveBeenCalledWith({ user_id: 'admin', password: 'hashed-pw', role: 'ADMIN' });
	});

	it('이미 존재하는 user_id면 ConflictException을 던지고 생성하지 않는다', async () => {
		userRepository.findByUserId.mockResolvedValue({ id: 1, user_id: 'admin' });

		await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
		expect(userRepository.create).not.toHaveBeenCalled();
	});
});
