// 가입 신청(해시·코드 대기 저장, 메일 발송)과 가입된 email 거부를 검증
import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupUseCase } from './signup.use-case';
import { PendingSignup } from './pending-signup.constants';
import { USER_REPOSITORY } from '@user/domain/user.repository';
import { CACHE_PORT } from '@infra/cache/cache.port';
import { MAIL_PORT } from '@infra/mail/mail.port';

jest.mock('bcrypt', () => ({ hash: jest.fn() }));

describe('SignupUseCase', () => {
	const userRepository = { findByEmail: jest.fn() };
	const cache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
	const mail = { send: jest.fn() };
	let useCase: SignupUseCase;

	const savedPending = (): PendingSignup => JSON.parse((cache.set).mock.calls[0][1] as string) as PendingSignup;

	beforeEach(async () => {
		jest.clearAllMocks();
		(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

		const module = await Test.createTestingModule({
			providers: [
				SignupUseCase,
				{ provide: USER_REPOSITORY, useValue: userRepository },
				{ provide: CACHE_PORT, useValue: cache },
				{ provide: MAIL_PORT, useValue: mail },
			],
		}).compile();

		useCase = module.get(SignupUseCase);
	});

	it('비밀번호 해시와 6자리 코드를 가입 대기 정보로 10분 TTL 저장한다', async () => {
		userRepository.findByEmail.mockResolvedValue(null);

		await useCase.execute('new@example.com', 'password123');

		expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
		expect(cache.set).toHaveBeenCalledWith('signup:new@example.com', expect.any(String), 1000 * 60 * 10);
		expect(savedPending()).toEqual({ password: 'hashed-password', code: expect.stringMatching(/^\d{6}$/) as string });
	});

	it('저장한 코드와 같은 코드를 메일 본문에 담아 발송한다', async () => {
		userRepository.findByEmail.mockResolvedValue(null);

		await useCase.execute('new@example.com', 'password123');

		expect(mail.send).toHaveBeenCalledWith('new@example.com', expect.any(String), expect.stringContaining(savedPending().code));
	});

	it('이미 가입된 email이면 ConflictException을 던지고 저장·발송하지 않는다', async () => {
		userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'dup@example.com' });

		await expect(useCase.execute('dup@example.com', 'password123')).rejects.toThrow(ConflictException);
		expect(cache.set).not.toHaveBeenCalled();
		expect(mail.send).not.toHaveBeenCalled();
	});
});
