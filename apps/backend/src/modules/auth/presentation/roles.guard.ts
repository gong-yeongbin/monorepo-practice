// @Roles(...)로 선언한 역할만 통과시키는 전역 가드 — JwtAuthGuard가 실어 둔 request.user.role로 판정한다
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from '@user/domain/user.entity';
import { AccessTokenPayload } from '@auth/application/token.constants';
import { IS_PUBLIC_KEY } from '@auth/presentation/public.decorator';
import { ROLES_KEY } from '@auth/presentation/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
			return true;
		}

		// @Public도 @Roles도 없는 라우트는 데코레이터 누락으로 보고 막는다 — 새 컨트롤러가 조용히 열리지 않게 하기 위함
		const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
		const { user } = context.switchToHttp().getRequest<Request & { user?: AccessTokenPayload }>();
		if (!roles || !user || !roles.includes(user.role)) {
			throw new ForbiddenException();
		}

		return true;
	}
}
