import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateAdvertiserInput, UpdateAdvertiserInput } from '@module/advertiser/dto/request';
import { Advertiser } from '@module/advertiser/dto/response';
import { CreateAdvertiserUseCase, GetAdvertisersUseCase, UpdateAdvertiserUseCase } from '@module/advertiser/use-case';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from '@common/guard';

@UseGuards(GraphqlAuthGuard)
@Resolver(() => Advertiser)
export class AdvertiserResolver {
	constructor(
		private readonly createAdvertiserUseCase: CreateAdvertiserUseCase,
		private readonly updateAdvertiserUseCase: UpdateAdvertiserUseCase,
		private readonly getAdvertisersUseCase: GetAdvertisersUseCase
	) {}

	@Query(() => [Advertiser], { name: 'advertisers' })
	async findAll() {
		return await this.getAdvertisersUseCase.execute();
	}

	@Mutation(() => Advertiser)
	async createAdvertiser(@Args('input') input: CreateAdvertiserInput) {
		console.log(input);
		return await this.createAdvertiserUseCase.execute(input.name);
	}

	@Mutation(() => Advertiser)
	async updateAdvertiser(@Args('input') input: UpdateAdvertiserInput) {
		return await this.updateAdvertiserUseCase.execute(input.id, input.name);
	}
}
