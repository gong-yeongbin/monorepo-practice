import { Module } from '@nestjs/common';
import { CreateUserUseCase } from '@module/user/use-case';
import { UserRepository } from '@module/user/infrastructure';
import { UserResolver } from '@module/user/controller';
import { USER_REPOSITORY } from '@module/user/domain/symbol';

@Module({
	providers: [UserResolver, CreateUserUseCase, { provide: USER_REPOSITORY, useClass: UserRepository }],
	exports: [USER_REPOSITORY],
})
export class UserModule {}
