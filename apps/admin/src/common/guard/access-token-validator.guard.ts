import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessTokenValidatorGuard {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {}

	async canActivate(context: ExecutionContext) {
		try {
			const request = context.switchToHttp().getRequest();
			// if (!request.cookies) throw new UnauthorizedException();
			const access_token: string = request.cookies.access_token;
			this.jwtService.verify(access_token, { secret: this.configService.get<string>('JWT_SECRET') });

			return true;
		} catch (e) {
			console.error(e.message);
		}
	}
}
