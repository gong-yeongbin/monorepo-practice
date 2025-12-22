import { CreateUserUseCase } from '@module/user/use-case';
import { CreateUserInput } from '@module/user/dto/request';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '@module/user/dto/response';

@Resolver(() => User)
export class UserResolver {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@Mutation(() => User)
	async createUser(@Args('input') input: CreateUserInput) {
		return await this.createUserUseCase.execute(input);
	}
}
