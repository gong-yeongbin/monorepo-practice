import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { CreateTokenUseCase, ValidateUserUseCase } from './use-case';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategy';

@Module({
	imports: [UserModule],
	controllers: [AuthController],
	providers: [LocalStrategy, CreateTokenUseCase, ValidateUserUseCase],
})
export class AuthModule {}
