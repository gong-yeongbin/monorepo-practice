import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-secure-cookie';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {
		super({ cookieNameField: 'access_token' });
	}

	async validate(token: string, done: (error: any, user?: any, info?: any) => void): Promise<void> {
		try {
			await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_SECRET') });
		} catch (e) {
			throw new UnauthorizedException();
		}
	}
}
