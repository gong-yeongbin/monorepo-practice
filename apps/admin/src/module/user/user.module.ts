import { Module } from '@nestjs/common';
import { UserResolver } from '@user/controller';
import { CreateUserUseCase } from '@user/use-case';
import { USER_REPOSITORY } from '@user/domain/symbol';
import { UserRepository } from '@user/infrastructure';

@Module({
	providers: [UserResolver, CreateUserUseCase, { provide: USER_REPOSITORY, useClass: UserRepository }],
	exports: [USER_REPOSITORY],
})
export class UserModule {}
