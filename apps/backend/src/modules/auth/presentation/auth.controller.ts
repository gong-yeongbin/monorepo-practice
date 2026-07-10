// 로그인·프로필 조회를 처리하는 컨트롤러
import { Controller, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { LoginUseCase } from '@auth/application/login.use-case';
import { JwtPayload } from '@auth/application/login.use-case';
import { LocalAuthGuard } from '@auth/presentation/local-auth.guard';
import { JwtAuthGuard } from '@auth/presentation/jwt-auth.guard';
import { GetProfileUseCase, Profile } from '@user/application/get-profile.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller()
@UseInterceptors(ResponseInterceptor)
export class AuthController {
	constructor(
		private readonly loginUseCase: LoginUseCase,
		private readonly getProfileUseCase: GetProfileUseCase
	) {}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	async login(@Req() request: Request) {
		return this.loginUseCase.execute(request.user as Profile);
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	async getProfile(@Req() request: Request) {
		const { user_id } = request.user as JwtPayload;
		return this.getProfileUseCase.execute(user_id);
	}
}
