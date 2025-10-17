import { Module } from '@nestjs/common';
import { UserController } from '@module/user/controller';
import { CreateUserUseCase } from '@module/user/use-case';
import { UserRepository } from '@module/user/domain';
import { PrismaUserRepository } from '@module/user/infrastructure';

@Module({
	controllers: [UserController],
	providers: [CreateUserUseCase, { provide: UserRepository, useClass: PrismaUserRepository }],
	exports: [{ provide: UserRepository, useClass: PrismaUserRepository }],
})
export class UserModule {}
