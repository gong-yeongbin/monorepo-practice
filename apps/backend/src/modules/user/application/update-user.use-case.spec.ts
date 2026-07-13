import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserUseCase } from './update-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UpdateUserUseCase', () => {
	const userRepository = { findById: jest.fn(), update: jest.fn() };
	let useCase: UpdateUserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [UpdateUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();
		useCase = module.get(UpdateUserUseCase);
	});

	it('password를 재해싱하고 role과 함께 수정해 프로필을 반환한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, user_id: 'admin', password: 'old', role: 'ADMIN' });
		mockedBcrypt.hash.mockResolvedValue('hashed-pw' as never);
		userRepository.update.mockResolvedValue({ id: 1, user_id: 'admin', password: 'hashed-pw', role: 'MEDIA' });

		const result = await useCase.execute(1, { password: 'newpw', role: 'MEDIA' });

		expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpw', 10);
		expect(userRepository.update).toHaveBeenCalledWith(1, { password: 'hashed-pw', role: 'MEDIA' });
		expect(result).toEqual({ id: 1, user_id: 'admin', role: 'MEDIA' });
	});

	it('role만 주면 password 해싱 없이 role만 수정한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, user_id: 'admin', password: 'old', role: 'ADMIN' });
		userRepository.update.mockResolvedValue({ id: 1, user_id: 'admin', password: 'old', role: 'ADVERTISER' });

		await useCase.execute(1, { role: 'ADVERTISER' });

		expect(mockedBcrypt.hash).not.toHaveBeenCalled();
		expect(userRepository.update).toHaveBeenCalledWith(1, { role: 'ADVERTISER' });
	});

	it('빈 dto면 아무 필드 없이 update를 호출한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, user_id: 'admin', password: 'old', role: 'ADMIN' });
		userRepository.update.mockResolvedValue({ id: 1, user_id: 'admin', password: 'old', role: 'ADMIN' });

		await useCase.execute(1, {});

		expect(mockedBcrypt.hash).not.toHaveBeenCalled();
		expect(userRepository.update).toHaveBeenCalledWith(1, {});
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		userRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1, { role: 'ADMIN' })).rejects.toThrow(NotFoundException);
		expect(userRepository.update).not.toHaveBeenCalled();
	});
});
