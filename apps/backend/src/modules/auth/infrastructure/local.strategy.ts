// user_id/password 로그인 검증을 담당하는 Passport local 전략
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ValidateUserUseCase } from '@auth/application/validate-user.use-case';
import { Profile } from '@user/application/get-profile.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly validateUserUseCase: ValidateUserUseCase) {
		super({ usernameField: 'user_id' });
	}

	async validate(user_id: string, password: string): Promise<Profile> {
		const user = await this.validateUserUseCase.execute(user_id, password);
		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}
}
