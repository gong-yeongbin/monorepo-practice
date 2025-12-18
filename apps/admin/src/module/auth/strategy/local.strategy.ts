import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ValidateUserUseCase } from '@module/auth/use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly validateUserUseCase: ValidateUserUseCase) {
		super({ usernameField: 'userId', passwordField: 'password' });
	}

	async validate(userId: string, password: string) {
		const user = await this.validateUserUseCase.execute(userId, password);

		if (user) return user;

		throw new UnauthorizedException();
	}
}
