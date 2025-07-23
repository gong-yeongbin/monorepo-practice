import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { CreateUserUseCase } from './use-case';

import { PrismaModule } from '../../core/prisma/prisma.module';
import { UserRepository } from './domain';
import { PrismaUserRepository } from './infrastructure';

@Module({
	imports: [PrismaModule],
	controllers: [UserController],
	providers: [CreateUserUseCase, { provide: UserRepository, useClass: PrismaUserRepository }],
	exports: [{ provide: UserRepository, useClass: PrismaUserRepository }],
})
export class UserModule {}
