// RolesGuard가 @Public은 통과시키고, @Roles에 선언된 역할만 허용하는지 검증
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { ROLES_KEY } from './roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
	const getAllAndOverride = jest.fn();
	const reflector = { getAllAndOverride } as unknown as Reflector;
	const guard = new RolesGuard(reflector);

	const contextWith = (user?: { role: string }) =>
		({
			getHandler: () => ({}),
			getClass: () => ({}),
			switchToHttp: () => ({ getRequest: () => ({ user }) }),
		}) as unknown as ExecutionContext;

	// 가드가 IS_PUBLIC_KEY·ROLES_KEY를 각각 조회하므로 키별로 응답을 나눈다
	const metadata = (values: { isPublic?: boolean; roles?: string[] }) =>
		getAllAndOverride.mockImplementation((key: string) => (key === IS_PUBLIC_KEY ? values.isPublic : key === ROLES_KEY ? values.roles : undefined));

	beforeEach(() => jest.clearAllMocks());

	it('@Public 라우트는 역할 검사 없이 통과시킨다', () => {
		metadata({ isPublic: true });

		expect(guard.canActivate(contextWith())).toBe(true);
	});

	it('@Public도 @Roles도 없으면 데코레이터 누락으로 보고 403을 던진다', () => {
		metadata({});

		expect(() => guard.canActivate(contextWith({ role: 'DEVELOPER' }))).toThrow(ForbiddenException);
	});

	it('request.user가 없으면 403을 던진다', () => {
		metadata({ roles: ['DEVELOPER'] });

		expect(() => guard.canActivate(contextWith())).toThrow(ForbiddenException);
	});

	it('허용 목록에 있는 역할은 통과시킨다', () => {
		metadata({ roles: ['DEVELOPER', 'ADMIN'] });

		expect(guard.canActivate(contextWith({ role: 'ADMIN' }))).toBe(true);
	});

	it('허용 목록에 없는 역할은 403을 던진다', () => {
		metadata({ roles: ['DEVELOPER', 'ADMIN'] });

		expect(() => guard.canActivate(contextWith({ role: 'USER' }))).toThrow(ForbiddenException);
	});
});
