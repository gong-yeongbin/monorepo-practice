// 회원가입(2단계 이메일 인증)·로그인·토큰 재발급을 처리하는 컨트롤러
import { Body, Controller, HttpCode, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RefreshDto } from '@auth/application/dto/refresh.dto';
import { SigninDto } from '@auth/application/dto/signin.dto';
import { SignupDto } from '@auth/application/dto/signup.dto';
import { VerifyDto } from '@auth/application/dto/verify.dto';
import { RefreshResult, RefreshUseCase } from '@auth/application/refresh.use-case';
import { SigninResult, SigninUseCase } from '@auth/application/signin.use-case';
import { SignupUseCase } from '@auth/application/signup.use-case';
import { VerifyUseCase } from '@auth/application/verify.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
	constructor(
		private readonly signupUseCase: SignupUseCase,
		private readonly verifyUseCase: VerifyUseCase,
		private readonly signinUseCase: SigninUseCase,
		private readonly refreshUseCase: RefreshUseCase
	) {}

	// 가입 1단계 — email·password를 받아 인증 코드를 발송한다. 이 시점에는 user가 생성되지 않으므로 201 대신 200을 반환한다
	@Post('signup')
	@HttpCode(200)
	@ApiOperation({ summary: '가입 1단계 — 인증 코드 발송' })
	async signup(@Body() body: SignupDto): Promise<void> {
		await this.signupUseCase.execute(body.email, body.password);
	}

	// 가입 2단계 — 메일로 받은 코드 검증을 통과하면 user가 생성된다
	@Post('signup/verify')
	@ApiOperation({ summary: '가입 2단계 — 인증 코드 검증 후 user 생성' })
	async verify(@Body() body: VerifyDto): Promise<void> {
		await this.verifyUseCase.execute(body.email, body.code);
	}

	// 로그인 — 검증 통과 시 access·refresh token을 발급한다
	@Post('signin')
	@HttpCode(200)
	@ApiOperation({ summary: '로그인 — access·refresh token 발급' })
	async signin(@Body() body: SigninDto): Promise<SigninResult> {
		return this.signinUseCase.execute(body.email, body.password);
	}

	// refresh token으로 access token을 재발급한다
	@Post('refresh')
	@HttpCode(200)
	@ApiOperation({ summary: 'refresh token으로 access token 재발급' })
	async refresh(@Body() body: RefreshDto): Promise<RefreshResult> {
		return this.refreshUseCase.execute(body.refresh_token);
	}
}
