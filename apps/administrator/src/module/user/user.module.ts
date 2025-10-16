import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { CreateUserUseCase } from './use-case';

import { UserRepository } from './domain';
import { PrismaUserRepository } from './infrastructure';

@Module({
	controllers: [UserController],
	providers: [CreateUserUseCase, { provide: UserRepository, useClass: PrismaUserRepository }],
	exports: [{ provide: UserRepository, useClass: PrismaUserRepository }],
})
export class UserModule {}
