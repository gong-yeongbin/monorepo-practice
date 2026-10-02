// 자격 증명 검증(없음·불일치 동일 401, 미승인 403)과 토큰 발급·refresh 캐시 저장, 그리고 모든 출구에서 로그인 기록이 남는지 검증
import { Test } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SigninUseCase } from './signin.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';
import { CACHE_PORT } from '@infra/cache/cache.port';
import { LOGIN_HISTORY_REPOSITORY } from '@auth/domain/login-history.repository';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

describe('SigninUseCase', () => {
	const userRepository = { findByEmailWithPassword: jest.fn() };
	const cache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
	const jwtService = { signAsync: jest.fn() };
	const configService = { getOrThrow: jest.fn() };
	const loginHistoryRepository = { create: jest.fn(), list: jest.fn() };
	let useCase: SigninUseCase;

	const user = { id: 1, email: 'user@example.com', password: 'hashed-password', role: 'ADMIN', approved: true, advertising_ids: [1, 2] };
	// 컨트롤러가 요청에서 꺼내 넘기는 클라이언트 정보 — 기록에 그대로 실린다
	const client = { ip: '203.0.113.10', user_agent: 'Mozilla/5.0 (Macintosh) Chrome/129.0' };

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
				{ provide: LOGIN_HISTORY_REPOSITORY, useValue: loginHistoryRepository },
			],
		}).compile();

		useCase = module.get(SigninUseCase);
	});

	it('검증 통과 시 access·refresh token을 발급하고 refresh를 7일 TTL로 캐시에 저장한다', async () => {
		userRepository.findByEmailWithPassword.mockResolvedValue(user);
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

		const result = await useCase.execute('user@example.com', 'password123', client);

		expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
		expect(jwtService.signAsync).toHaveBeenNthCalledWith(
			1,
			{ sub: 1, email: 'user@example.com', role: 'ADMIN', advertising_ids: [1, 2] },
			{ secret: 'access-secret', expiresIn: '15m' }
		);
		expect(jwtService.signAsync).toHaveBeenNthCalledWith(2, { sub: 1 }, { secret: 'refresh-secret', expiresIn: '7d' });
		expect(cache.set).toHaveBeenCalledWith('refresh:1', 'refresh-token', 1000 * 60 * 60 * 24 * 7);
		expect(result).toEqual({ access_token: 'access-token', refresh_token: 'refresh-token' });
		expect(loginHistoryRepository.create).toHaveBeenCalledWith({ user_id: 1, email: 'user@example.com', result: 'SUCCESS', ip: client.ip, user_agent: client.user_agent });
	});

	it('없는 email이면 UnauthorizedException을 던지고 비밀번호를 비교하지 않는다', async () => {
		userRepository.findByEmailWithPassword.mockResolvedValue(null);

		await expect(useCase.execute('none@example.com', 'password123', client)).rejects.toThrow(UnauthorizedException);
		expect(bcrypt.compare).not.toHaveBeenCalled();
		expect(jwtService.signAsync).not.toHaveBeenCalled();
		// 계정이 없어도 시도 자체는 남긴다 — user_id는 null, email은 입력값 그대로
		expect(loginHistoryRepository.create).toHaveBeenCalledWith({
			user_id: null,
			email: 'none@example.com',
			result: 'INVALID_CREDENTIALS',
			ip: client.ip,
			user_agent: client.user_agent,
		});
	});

	it('비밀번호가 불일치하면 UnauthorizedException을 던지고 토큰을 발급하지 않는다', async () => {
		userRepository.findByEmailWithPassword.mockResolvedValue(user);
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		await expect(useCase.execute('user@example.com', 'wrong-password', client)).rejects.toThrow(UnauthorizedException);
		expect(jwtService.signAsync).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
		expect(loginHistoryRepository.create).toHaveBeenCalledWith({
			user_id: 1,
			email: 'user@example.com',
			result: 'INVALID_CREDENTIALS',
			ip: client.ip,
			user_agent: client.user_agent,
		});
	});

	it('미승인(approved=false) user면 ForbiddenException을 던지고 토큰을 발급하지 않는다', async () => {
		userRepository.findByEmailWithPassword.mockResolvedValue({ ...user, approved: false });
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);

		await expect(useCase.execute('user@example.com', 'password123', client)).rejects.toThrow(ForbiddenException);
		expect(jwtService.signAsync).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
		expect(loginHistoryRepository.create).toHaveBeenCalledWith({ user_id: 1, email: 'user@example.com', result: 'NOT_APPROVED', ip: client.ip, user_agent: client.user_agent });
	});
});
