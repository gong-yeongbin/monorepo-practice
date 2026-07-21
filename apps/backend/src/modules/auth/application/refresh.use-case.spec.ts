// refresh token 검증 실패(서명·캐시 대조·user 없음 전부 401)와 미승인 403, access 재발급을 검증
import { Test } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshUseCase } from './refresh.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';
import { CACHE_PORT } from '@infra/cache/cache.port';

describe('RefreshUseCase', () => {
	const userRepository = { findById: jest.fn() };
	const cache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
	const jwtService = { verifyAsync: jest.fn(), signAsync: jest.fn() };
	const configService = { getOrThrow: jest.fn() };
	let useCase: RefreshUseCase;

	const user = { id: 1, email: 'user@example.com', role: 'ADMIN', approved: true };

	beforeEach(async () => {
		jest.clearAllMocks();
		configService.getOrThrow.mockImplementation((key: string) => (key === 'JWT_ACCESS_SECRET' ? 'access-secret' : 'refresh-secret'));

		const module = await Test.createTestingModule({
			providers: [
				RefreshUseCase,
				{ provide: USER_REPOSITORY, useValue: userRepository },
				{ provide: CACHE_PORT, useValue: cache },
				{ provide: JwtService, useValue: jwtService },
				{ provide: ConfigService, useValue: configService },
			],
		}).compile();

		useCase = module.get(RefreshUseCase);
	});

	it('검증 통과 시 새 access token을 발급한다', async () => {
		jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
		cache.get.mockResolvedValue('refresh-token');
		userRepository.findById.mockResolvedValue(user);
		jwtService.signAsync.mockResolvedValue('new-access-token');

		const result = await useCase.execute('refresh-token');

		expect(jwtService.verifyAsync).toHaveBeenCalledWith('refresh-token', { secret: 'refresh-secret' });
		expect(cache.get).toHaveBeenCalledWith('refresh:1');
		expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 1, email: 'user@example.com', role: 'ADMIN' }, { secret: 'access-secret', expiresIn: '15m' });
		expect(result).toEqual({ access_token: 'new-access-token' });
	});

	it('서명이 무효하면 UnauthorizedException을 던지고 캐시를 조회하지 않는다', async () => {
		jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

		await expect(useCase.execute('bad-token')).rejects.toThrow(UnauthorizedException);
		expect(cache.get).not.toHaveBeenCalled();
		expect(jwtService.signAsync).not.toHaveBeenCalled();
	});

	it('캐시에 저장된 refresh가 없으면(만료) UnauthorizedException을 던진다', async () => {
		jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
		cache.get.mockResolvedValue(null);

		await expect(useCase.execute('refresh-token')).rejects.toThrow(UnauthorizedException);
		expect(jwtService.signAsync).not.toHaveBeenCalled();
	});

	it('캐시 값과 다르면(재로그인으로 교체) UnauthorizedException을 던진다', async () => {
		jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
		cache.get.mockResolvedValue('other-refresh-token');

		await expect(useCase.execute('refresh-token')).rejects.toThrow(UnauthorizedException);
		expect(jwtService.signAsync).not.toHaveBeenCalled();
	});

	it('user가 없으면(탈퇴) UnauthorizedException을 던진다', async () => {
		jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
		cache.get.mockResolvedValue('refresh-token');
		userRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute('refresh-token')).rejects.toThrow(UnauthorizedException);
		expect(jwtService.signAsync).not.toHaveBeenCalled();
	});

	it('미승인(approved=false) user면 ForbiddenException을 던지고 발급하지 않는다', async () => {
		jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
		cache.get.mockResolvedValue('refresh-token');
		userRepository.findById.mockResolvedValue({ ...user, approved: false });

		await expect(useCase.execute('refresh-token')).rejects.toThrow(ForbiddenException);
		expect(jwtService.signAsync).not.toHaveBeenCalled();
	});
});
