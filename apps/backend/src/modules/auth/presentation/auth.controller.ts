// 이메일 인증 기반 2단계 회원가입(신청·코드 검증)을 처리하는 컨트롤러
import { Body, Controller, HttpCode, Post, UseInterceptors } from '@nestjs/common';
import { SignupDto } from '@auth/application/dto/signup.dto';
import { VerifyDto } from '@auth/application/dto/verify.dto';
import { SignupUseCase } from '@auth/application/signup.use-case';
import { VerifyUseCase } from '@auth/application/verify.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
	constructor(
		private readonly signupUseCase: SignupUseCase,
		private readonly verifyUseCase: VerifyUseCase
	) {}

	// 가입 1단계 — email·password를 받아 인증 코드를 발송한다. 이 시점에는 user가 생성되지 않으므로 201 대신 200을 반환한다
	@Post('signup')
	@HttpCode(200)
	async signup(@Body() body: SignupDto): Promise<void> {
		await this.signupUseCase.execute(body.email, body.password);
	}

	// 가입 2단계 — 메일로 받은 코드 검증을 통과하면 user가 생성된다
	@Post('signup/verify')
	async verify(@Body() body: VerifyDto): Promise<void> {
		await this.verifyUseCase.execute(body.email, body.code);
	}
}
