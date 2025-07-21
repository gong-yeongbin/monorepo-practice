import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { CreateUserUseCase } from './use-case';
import { UserRepository } from './domain/user-repository';
import { PrismaUserRepository } from './infrastructure/prisma-user-repository';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [UserController],
	providers: [CreateUserUseCase, { provide: UserRepository, useClass: PrismaUserRepository }],
})
export class UserModule {}
