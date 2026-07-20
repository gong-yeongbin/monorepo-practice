import { Module } from '@nestjs/common';
import { CacheModule } from '@infra/cache/cache.module';
import { MailModule } from '@infra/mail/mail.module';
import { UserController } from '@user/presentation/user.controller';
import { RequestSignupUseCase } from '@user/application/request-signup.use-case';
import { VerifySignupUseCase } from '@user/application/verify-signup.use-case';
import { ListUserUseCase } from '@user/application/list-user.use-case';
import { GetUserUseCase } from '@user/application/get-user.use-case';
import { UpdateUserUseCase } from '@user/application/update-user.use-case';
import { DeleteUserUseCase } from '@user/application/delete-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';
import { PrismaUserRepository } from '@user/infrastructure/prisma-user.repository';

@Module({
	imports: [CacheModule, MailModule],
	controllers: [UserController],
	providers: [
		RequestSignupUseCase,
		VerifySignupUseCase,
		ListUserUseCase,
		GetUserUseCase,
		UpdateUserUseCase,
		DeleteUserUseCase,
		{ provide: USER_REPOSITORY, useClass: PrismaUserRepository },
	],
})
export class UserModule {}
