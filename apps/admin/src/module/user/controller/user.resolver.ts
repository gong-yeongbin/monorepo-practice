import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '@user/dto/response';
import { CreateUserUseCase } from '@user/use-case';
import { CreateUserInput } from '@user/dto/request';
import { GraphqlAuthGuard } from '@src/common/guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(GraphqlAuthGuard)
@Resolver(() => User)
export class UserResolver {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@Mutation(() => User)
	async createUser(@Args('input') input: CreateUserInput) {
		return await this.createUserUseCase.execute(input);
	}
}
