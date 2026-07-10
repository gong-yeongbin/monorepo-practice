import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '@auth/presentation/auth.controller';
import { LoginUseCase } from '@auth/application/login.use-case';
import { ValidateUserUseCase } from '@auth/application/validate-user.use-case';
import { LocalStrategy } from '@auth/infrastructure/local.strategy';
import { JwtStrategy } from '@auth/infrastructure/jwt.strategy';
import { UserModule } from '@user/user.module';

@Module({
	imports: [
		UserModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	],
	controllers: [AuthController],
	providers: [LoginUseCase, ValidateUserUseCase, LocalStrategy, JwtStrategy],
	exports: [JwtModule, PassportModule],
})
export class AuthModule {}
