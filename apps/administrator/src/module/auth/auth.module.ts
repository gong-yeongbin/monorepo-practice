import { Module } from '@nestjs/common';
import { CreateTokenUseCase, ValidateUserUseCase } from './use-case';
import { LocalStrategy } from './strategy';
import { AuthController } from '@module/auth/controller';
import { UserModule } from '@module/user/user.module';

@Module({
	imports: [UserModule],
	controllers: [AuthController],
	providers: [LocalStrategy, CreateTokenUseCase, ValidateUserUseCase],
})
export class AuthModule {}
