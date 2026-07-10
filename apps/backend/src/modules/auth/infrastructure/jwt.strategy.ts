// Bearer 토큰의 서명·만료를 검증하는 Passport JWT 전략
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@auth/application/login.use-case';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET as string,
		});
	}

	validate(payload: JwtPayload): JwtPayload {
		return { user_id: payload.user_id, role: payload.role };
	}
}
