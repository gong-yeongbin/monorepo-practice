import { Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CreateTokenUseCase } from '@module/auth/use-case';
import { LocalAuthGuard } from '@common/guard';
import { UserDto } from '@module/user/dto/user.dto';
import { User } from '@module/auth/decorator';

@Controller('auth')
export class AuthController {
	private readonly cookieConfig: Record<string, any>;
	private readonly jwtExpires: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly createTokenUseCase: CreateTokenUseCase
	) {
		this.cookieConfig = { secure: configService.get<string>('ENV') != 'DEV', httpOnly: true, maxAge: configService.get<number>('JWT_EXPIRES') ?? 0 };
	}

	@UseGuards(LocalAuthGuard)
	@Post('sign-in')
	@HttpCode(HttpStatus.OK)
	async signIn(@User() user: UserDto, @Res() response: Response): Promise<Response<any, Record<string, any>>> {
		const access_token = await this.createTokenUseCase.execute(user);
		return response.cookie('access_token', access_token, this.cookieConfig).send();
	}
}
