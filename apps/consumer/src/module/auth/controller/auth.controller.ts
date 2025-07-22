import { Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '../common/decorator';
import { UserDto } from '../../user/shared/dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateTokenUseCase } from '../use-case';

@Controller('auth')
export class AuthController {
	constructor(private readonly createTokenUseCase: CreateTokenUseCase) {}

	@UseGuards(AuthGuard('local'))
	@Post('sign-in')
	async signIn(@User() user: UserDto) {
		return await this.createTokenUseCase.execute(user);
	}
}
