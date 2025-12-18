import { Module } from '@nestjs/common';
import { CreateTokenUseCase, ValidateUserUseCase } from './use-case';
import { LocalStrategy } from './strategy';
import { AuthController, AuthResolver } from '@module/auth/controller';
import { UserModule } from '@module/user/user.module';
import { CookieStrategy } from '@module/auth/strategy/cookie.strategy';

@Module({
	imports: [UserModule],
	controllers: [AuthController],
	providers: [AuthResolver, LocalStrategy, CookieStrategy, CreateTokenUseCase, ValidateUserUseCase],
})
export class AuthModule {}
