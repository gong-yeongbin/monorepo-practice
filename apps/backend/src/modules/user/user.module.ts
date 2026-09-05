import { Module } from '@nestjs/common';
import { UserController } from '@user/presentation/user.controller';
import { ListUserUseCase } from '@user/application/list-user.use-case';
import { GetUserUseCase } from '@user/application/get-user.use-case';
import { UpdateUserUseCase } from '@user/application/update-user.use-case';
import { DeleteUserUseCase } from '@user/application/delete-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';
import { PrismaUserRepository } from '@user/infrastructure/prisma-user.repository';

@Module({
	controllers: [UserController],
	providers: [ListUserUseCase, GetUserUseCase, UpdateUserUseCase, DeleteUserUseCase, { provide: USER_REPOSITORY, useClass: PrismaUserRepository }],
	exports: [USER_REPOSITORY],
})
export class UserModule {}
