// Authorization: Bearer access token을 검증해 request.user에 payload를 싣는 전역 가드(@Public 라우트는 통과)
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AccessTokenPayload } from '@auth/application/token.constants';
import { IS_PUBLIC_KEY } from '@auth/presentation/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request & { user?: AccessTokenPayload }>();
		const [scheme, token] = (request.headers.authorization ?? '').split(' ');
		if (scheme !== 'Bearer' || !token) {
			throw new UnauthorizedException();
		}

		// 서명 무효·만료는 원인을 노출하지 않고 모두 401로 통일한다(signin·refresh use-case와 같은 방침)
		try {
			request.user = await this.jwtService.verifyAsync<AccessTokenPayload>(token, { secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET') });
		} catch {
			throw new UnauthorizedException();
		}

		return true;
	}
}
