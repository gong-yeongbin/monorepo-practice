import { Module } from '@nestjs/common';
import { UserController } from '@user/presentation/user.controller';
import { CreateUserUseCase } from '@user/application/create-user.use-case';
import { GetProfileUseCase } from '@user/application/get-profile.use-case';
import { FindUserUseCase } from '@user/application/find-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';
import { PrismaUserRepository } from '@user/infrastructure/prisma-user.repository';

@Module({
	controllers: [UserController],
	providers: [CreateUserUseCase, GetProfileUseCase, FindUserUseCase, { provide: USER_REPOSITORY, useClass: PrismaUserRepository }],
	exports: [FindUserUseCase, GetProfileUseCase],
})
export class UserModule {}
