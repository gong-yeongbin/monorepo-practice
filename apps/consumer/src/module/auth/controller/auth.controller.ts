import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { User } from '../common/decorator';
import { UserDto } from '../../user/shared/dto';
import { CreateTokenUseCase } from '../use-case';
import { LocalAuthGuard } from '../../../common/guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
	private readonly jwtExpires: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly createTokenUseCase: CreateTokenUseCase
	) {
		this.jwtExpires = configService.get<number>('JWT_EXPIRES') ?? 0;
	}

	@UseGuards(LocalAuthGuard)
	@Post('sign-in')
	async signIn(@User() user: UserDto, @Res() response: Response) {
		const access_token = await this.createTokenUseCase.execute(user);
		return response.cookie('access_token', access_token, { secure: true, httpOnly: true, maxAge: this.jwtExpires }).send();
	}
}
