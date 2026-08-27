// JwtAuthGuard가 @Public을 통과시키고, Bearer 토큰을 검증해 request.user를 채우는지 검증
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
	const getAllAndOverride = jest.fn();
	const verifyAsync = jest.fn();
	const getOrThrow = jest.fn().mockReturnValue('access-secret');

	const reflector = { getAllAndOverride } as unknown as Reflector;
	const jwtService = { verifyAsync } as unknown as JwtService;
	const configService = { getOrThrow } as unknown as ConfigService;
	const guard = new JwtAuthGuard(reflector, jwtService, configService);

	// getRequest가 매번 같은 객체를 돌려줘야 가드가 심은 user를 테스트에서 확인할 수 있다
	const contextWith = (request: { headers: Record<string, string | undefined> }) =>
		({
			getHandler: () => ({}),
			getClass: () => ({}),
			switchToHttp: () => ({ getRequest: () => request }),
		}) as unknown as ExecutionContext;

	beforeEach(() => {
		jest.clearAllMocks();
		getAllAndOverride.mockReturnValue(undefined);
	});

	it('@Public 라우트는 토큰 검증 없이 통과시킨다', async () => {
		getAllAndOverride.mockReturnValue(true);
		const request = { headers: {} };

		expect(await guard.canActivate(contextWith(request))).toBe(true);
		expect(verifyAsync).not.toHaveBeenCalled();
	});

	it('Authorization 헤더가 없으면 401을 던진다', async () => {
		await expect(guard.canActivate(contextWith({ headers: {} }))).rejects.toThrow(UnauthorizedException);
	});

	it('Bearer 스킴이 아니면 401을 던진다', async () => {
		await expect(guard.canActivate(contextWith({ headers: { authorization: 'Basic abcdef' } }))).rejects.toThrow(UnauthorizedException);
		expect(verifyAsync).not.toHaveBeenCalled();
	});

	it('토큰이 비어 있으면 401을 던진다', async () => {
		await expect(guard.canActivate(contextWith({ headers: { authorization: 'Bearer' } }))).rejects.toThrow(UnauthorizedException);
	});

	it('서명·만료 검증에 실패하면 401을 던진다', async () => {
		verifyAsync.mockRejectedValue(new Error('jwt expired'));

		await expect(guard.canActivate(contextWith({ headers: { authorization: 'Bearer garbage' } }))).rejects.toThrow(UnauthorizedException);
	});

	it('검증에 성공하면 request.user에 payload를 싣고 통과시킨다', async () => {
		const payload = { sub: 1, email: 'admin@example.com', role: 'DEVELOPER' };
		verifyAsync.mockResolvedValue(payload);
		const request: { headers: Record<string, string>; user?: unknown } = { headers: { authorization: 'Bearer valid-token' } };

		expect(await guard.canActivate(contextWith(request))).toBe(true);
		expect(request.user).toBe(payload);
		expect(verifyAsync).toHaveBeenCalledWith('valid-token', { secret: 'access-secret' });
		expect(getOrThrow).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
	});
});
