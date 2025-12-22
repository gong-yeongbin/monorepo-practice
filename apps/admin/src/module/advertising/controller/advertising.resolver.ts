import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateAdvertisingUseCase, GetAdvertisingListUseCase, GetAdvertisingUseCase, UpdateAdvertisingUseCase } from '@module/advertising/use-case';
import { Advertising } from '@advertising/dto/response';
import { CreateAdvertisingInput, UpdateAdvertisingInput } from '@advertising/dto/request';

@Resolver(() => Advertising)
export class AdvertisingResolver {
	constructor(
		private readonly createAdvertisingUseCase: CreateAdvertisingUseCase,
		private readonly updateAdvertisingUseCase: UpdateAdvertisingUseCase,
		private readonly getAdvertisingListUseCase: GetAdvertisingListUseCase,
		private readonly getAdvertisingUseCase: GetAdvertisingUseCase
	) {}

	@Query(() => Advertising, { name: 'advertising' })
	async findOne(@Args('id', { type: () => Int }) id: number) {
		return await this.getAdvertisingUseCase.execute(id);
	}

	@Query(() => [Advertising], { name: 'advertisings' })
	async findAll() {
		return await this.getAdvertisingListUseCase.execute();
	}

	@Mutation(() => Advertising)
	async createAdvertising(@Args('input') input: CreateAdvertisingInput) {
		return await this.createAdvertisingUseCase.execute(input);
	}

	@Mutation(() => Advertising)
	async updateAdvertising(@Args('input') input: UpdateAdvertisingInput) {
		return await this.updateAdvertisingUseCase.execute(input);
	}
}
