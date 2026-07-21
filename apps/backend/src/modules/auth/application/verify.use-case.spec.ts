// 코드 검증 통과 시에만 대기 정보의 해시로 가입되는지(중복 409·코드 오류 400 포함)를 검증
import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { VerifyUseCase } from './verify.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';
import { CACHE_PORT } from '@infra/cache/cache.port';

describe('VerifyUseCase', () => {
	const userRepository = { findByEmail: jest.fn(), create: jest.fn() };
	const cache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
	let useCase: VerifyUseCase;

	const pending = JSON.stringify({ password: 'hashed-password', code: '123456' });

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [VerifyUseCase, { provide: USER_REPOSITORY, useValue: userRepository }, { provide: CACHE_PORT, useValue: cache }],
		}).compile();

		useCase = module.get(VerifyUseCase);
	});

	it('코드가 일치하면 대기 정보의 해시로 user를 생성하고 대기 정보를 삭제한다', async () => {
		userRepository.findByEmail.mockResolvedValue(null);
		cache.get.mockResolvedValue(pending);

		await useCase.execute('new@example.com', '123456');

		expect(userRepository.create).toHaveBeenCalledWith({ email: 'new@example.com', password: 'hashed-password' });
		expect(cache.del).toHaveBeenCalledWith('signup:new@example.com');
	});

	it('이미 가입된 email이면 ConflictException을 던지고 대기 정보를 조회하지 않는다', async () => {
		userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'dup@example.com' });

		await expect(useCase.execute('dup@example.com', '123456')).rejects.toThrow(ConflictException);
		expect(cache.get).not.toHaveBeenCalled();
		expect(userRepository.create).not.toHaveBeenCalled();
	});

	it('대기 정보가 만료됐으면(캐시 miss) BadRequestException을 던지고 생성하지 않는다', async () => {
		userRepository.findByEmail.mockResolvedValue(null);
		cache.get.mockResolvedValue(null);

		await expect(useCase.execute('new@example.com', '123456')).rejects.toThrow(BadRequestException);
		expect(userRepository.create).not.toHaveBeenCalled();
		expect(cache.del).not.toHaveBeenCalled();
	});

	it('코드가 불일치하면 BadRequestException을 던지고 생성하지 않는다', async () => {
		userRepository.findByEmail.mockResolvedValue(null);
		cache.get.mockResolvedValue(pending);

		await expect(useCase.execute('new@example.com', '654321')).rejects.toThrow(BadRequestException);
		expect(userRepository.create).not.toHaveBeenCalled();
		expect(cache.del).not.toHaveBeenCalled();
	});
});
