import { Module } from '@nestjs/common';
import { UserModule } from '@user/user.module';
import { AuthResolver } from '@auth/controller';
import { CookieStrategy, LocalStrategy } from '@auth/strategy';
import { CreateTokenUseCase, ValidateUserUseCase } from '@auth/use-case';

@Module({
	imports: [UserModule],
	providers: [AuthResolver, LocalStrategy, CookieStrategy, CreateTokenUseCase, ValidateUserUseCase],
})
export class AuthModule {}
