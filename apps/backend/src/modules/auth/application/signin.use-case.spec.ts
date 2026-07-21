// 자격 증명 검증(없음·불일치 동일 401, 미승인 403)과 토큰 발급·refresh 캐시 저장을 검증
import { Test } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SigninUseCase } from './signin.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';
import { CACHE_PORT } from '@infra/cache/cache.port';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

describe('SigninUseCase', () => {
	const userRepository = { findByEmailWithPassword: jest.fn() };
	const cache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
	const jwtService = { signAsync: jest.fn() };
	const configService = { getOrThrow: jest.fn() };
	let useCase: SigninUseCase;

	const user = { id: 1, email: 'user@example.com', password: 'hashed-password', role: 'ADMIN', approved: true };

	beforeEach(async () => {
		jest.clearAllMocks();
		configService.getOrThrow.mockImplementation((key: string) => (key === 'JWT_ACCESS_SECRET' ? 'access-secret' : 'refresh-secret'));

		const module = await Test.createTestingModule({
			providers: [
				SigninUseCase,
				{ provide: USER_REPOSITORY, useValue: userRepository },
				{ provide: CACHE_PORT, useValue: cache },
				{ provide: JwtService, useValue: jwtService },
				{ provide: ConfigService, useValue: configService },
			],
		}).compile();

		useCase = module.get(SigninUseCase);
	});

	it('검증 통과 시 access·refresh token을 발급하고 refresh를 7일 TTL로 캐시에 저장한다', async () => {
		userRepository.findByEmailWithPassword.mockResolvedValue(user);
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

		const result = await useCase.execute('user@example.com', 'password123');

		expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
		expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, { sub: 1, email: 'user@example.com', role: 'ADMIN' }, { secret: 'access-secret', expiresIn: '15m' });
		expect(jwtService.signAsync).toHaveBeenNthCalledWith(2, { sub: 1 }, { secret: 'refresh-secret', expiresIn: '7d' });
		expect(cache.set).toHaveBeenCalledWith('refresh:1', 'refresh-token', 1000 * 60 * 60 * 24 * 7);
		expect(result).toEqual({ access_token: 'access-token', refresh_token: 'refresh-token' });
	});

	it('없는 email이면 UnauthorizedException을 던지고 비밀번호를 비교하지 않는다', async () => {
		userRepository.findByEmailWithPassword.mockResolvedValue(null);

		await expect(useCase.execute('none@example.com', 'password123')).rejects.toThrow(UnauthorizedException);
		expect(bcrypt.compare).not.toHaveBeenCalled();
		expect(jwtService.signAsync).not.toHaveBeenCalled();
	});

	it('비밀번호가 불일치하면 UnauthorizedException을 던지고 토큰을 발급하지 않는다', async () => {
		userRepository.findByEmailWithPassword.mockResolvedValue(user);
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		await expect(useCase.execute('user@example.com', 'wrong-password')).rejects.toThrow(UnauthorizedException);
		expect(jwtService.signAsync).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
	});

	it('미승인(approved=false) user면 ForbiddenException을 던지고 토큰을 발급하지 않는다', async () => {
		userRepository.findByEmailWithPassword.mockResolvedValue({ ...user, approved: false });
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);

		await expect(useCase.execute('user@example.com', 'password123')).rejects.toThrow(ForbiddenException);
		expect(jwtService.signAsync).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
	});
});
