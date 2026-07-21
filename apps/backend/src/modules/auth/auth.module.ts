// 회원가입(2단계 이메일 인증) 기능의 DI 배선 모듈 — user 생성·조회는 UserModule이 export하는 USER_REPOSITORY를 사용한다
import { Module } from '@nestjs/common';
import { CacheModule } from '@infra/cache/cache.module';
import { MailModule } from '@infra/mail/mail.module';
import { UserModule } from '@user/user.module';
import { AuthController } from '@auth/presentation/auth.controller';
import { RequestSignupUseCase } from '@auth/application/request-signup.use-case';
import { VerifySignupUseCase } from '@auth/application/verify-signup.use-case';

@Module({
	imports: [CacheModule, MailModule, UserModule],
	controllers: [AuthController],
	providers: [RequestSignupUseCase, VerifySignupUseCase],
})
export class AuthModule {}
