// 가입된 email 중복 검사 함수의 통과·409 경로를 검증
import { ConflictException } from '@nestjs/common';
import { ensureEmailNotRegistered } from './ensure-email-not-registered';
import { UserRepository } from '@user/domain/user.repository';

describe('ensureEmailNotRegistered', () => {
	const userRepository = { findByEmail: jest.fn() } as unknown as UserRepository;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('가입되지 않은 email이면 아무것도 던지지 않는다', async () => {
		(userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

		await expect(ensureEmailNotRegistered(userRepository, 'new@example.com')).resolves.toBeUndefined();
		expect(userRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
	});

	it('이미 가입된 email이면 ConflictException을 던진다', async () => {
		(userRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'dup@example.com' });

		await expect(ensureEmailNotRegistered(userRepository, 'dup@example.com')).rejects.toThrow(ConflictException);
	});
});
