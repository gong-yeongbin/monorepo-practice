// 회원가입(2단계 이메일 인증)·로그인·토큰 재발급의 DI 배선 모듈 — user 조회·생성은 UserModule이 export하는 USER_REPOSITORY를 사용한다
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@infra/cache/cache.module';
import { MailModule } from '@infra/mail/mail.module';
import { UserModule } from '@user/user.module';
import { AuthController } from '@auth/presentation/auth.controller';
import { SignupUseCase } from '@auth/application/signup.use-case';
import { VerifyUseCase } from '@auth/application/verify.use-case';
import { SigninUseCase } from '@auth/application/signin.use-case';
import { RefreshUseCase } from '@auth/application/refresh.use-case';
import { CheckEmailAvailabilityUseCase } from '@auth/application/check-email-availability.use-case';

@Module({
	// JwtModule은 기본 설정 없이 등록한다 — secret·만료는 use-case가 서명·검증 시점에 직접 넘긴다(access·refresh secret이 달라서)
	imports: [CacheModule, MailModule, UserModule, JwtModule.register({})],
	controllers: [AuthController],
	providers: [SignupUseCase, VerifyUseCase, SigninUseCase, RefreshUseCase, CheckEmailAvailabilityUseCase],
})
export class AuthModule {}
