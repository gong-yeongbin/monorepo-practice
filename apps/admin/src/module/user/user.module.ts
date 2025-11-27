import { Module } from '@nestjs/common';
import { UserController } from '@module/user/controller';
import { CreateUserUseCase } from '@module/user/use-case';
import { UserRepository } from '@module/user/infrastructure';
import { USER_REPOSITORY } from '@module/user/domain';

@Module({
	controllers: [UserController],
	providers: [CreateUserUseCase, { provide: USER_REPOSITORY, useClass: UserRepository }],
	exports: [USER_REPOSITORY],
})
export class UserModule {}
