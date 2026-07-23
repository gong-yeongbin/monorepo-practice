// 회원가입(2단계 이메일 인증)·로그인·토큰 재발급을 처리하는 컨트롤러
import { Body, Controller, Get, HttpCode, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailAvailabilityDto } from '@auth/application/dto/email-availability.dto';
import { RefreshDto } from '@auth/application/dto/refresh.dto';
import { SigninDto } from '@auth/application/dto/signin.dto';
import { SignupDto } from '@auth/application/dto/signup.dto';
import { VerifyDto } from '@auth/application/dto/verify.dto';
import { CheckEmailAvailabilityUseCase, EmailAvailabilityResult } from '@auth/application/check-email-availability.use-case';
import { RefreshResult, RefreshUseCase } from '@auth/application/refresh.use-case';
import { SigninResult, SigninUseCase } from '@auth/application/signin.use-case';
import { SignupUseCase } from '@auth/application/signup.use-case';
import { VerifyUseCase } from '@auth/application/verify.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { EmailAvailabilityResponse, RefreshResponse, SigninResponse } from '@auth/presentation/dto/auth.response.dto';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
	constructor(
		private readonly signupUseCase: SignupUseCase,
		private readonly verifyUseCase: VerifyUseCase,
		private readonly signinUseCase: SigninUseCase,
		private readonly refreshUseCase: RefreshUseCase,
		private readonly checkEmailAvailabilityUseCase: CheckEmailAvailabilityUseCase
	) {}

	// 가입 전 이메일 사용 가능 여부 조회 — 클라이언트 사전 확인용이며 최종 방어는 signup·verify의 중복 검사가 담당한다
	@Get('email-availability')
	@ApiOperation({ summary: '가입 전 이메일 사용 가능 여부 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: EmailAvailabilityResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async emailAvailability(@Query() query: EmailAvailabilityDto): Promise<EmailAvailabilityResult> {
		return this.checkEmailAvailabilityUseCase.execute(query.email);
	}

	// 가입 1단계 — email·password를 받아 인증 코드를 발송한다. 이 시점에는 user가 생성되지 않으므로 201 대신 200을 반환한다
	@Post('signup')
	@HttpCode(200)
	@ApiOperation({ summary: '가입 1단계 — 인증 코드 발송' })
	@ApiWrappedResponse({ status: 200, description: '인증 코드 발송 성공' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 409, description: '이미 가입된 email' })
	async signup(@Body() body: SignupDto): Promise<void> {
		await this.signupUseCase.execute(body.email, body.password);
	}

	// 가입 2단계 — 메일로 받은 코드 검증을 통과하면 user가 생성된다
	@Post('signup/verify')
	@ApiOperation({ summary: '가입 2단계 — 인증 코드 검증 후 user 생성' })
	@ApiWrappedResponse({ status: 201, description: '검증 통과, user 생성' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패 또는 인증 코드 불일치·만료' })
	@ApiResponse({ status: 409, description: '이미 가입된 email' })
	async verify(@Body() body: VerifyDto): Promise<void> {
		await this.verifyUseCase.execute(body.email, body.code);
	}

	// 로그인 — 검증 통과 시 access·refresh token을 발급한다
	@Post('signin')
	@HttpCode(200)
	@ApiOperation({ summary: '로그인 — access·refresh token 발급' })
	@ApiWrappedResponse({ status: 200, description: '로그인 성공, access·refresh token 반환', type: SigninResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 401, description: 'email 없음 또는 비밀번호 불일치' })
	@ApiResponse({ status: 403, description: '미승인 계정' })
	async signin(@Body() body: SigninDto): Promise<SigninResult> {
		return this.signinUseCase.execute(body.email, body.password);
	}

	// refresh token으로 access token을 재발급한다
	@Post('refresh')
	@HttpCode(200)
	@ApiOperation({ summary: 'refresh token으로 access token 재발급' })
	@ApiWrappedResponse({ status: 200, description: '재발급 성공', type: RefreshResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 401, description: 'refresh token 무효·만료' })
	@ApiResponse({ status: 403, description: '미승인 계정' })
	async refresh(@Body() body: RefreshDto): Promise<RefreshResult> {
		return this.refreshUseCase.execute(body.refresh_token);
	}
}
