import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from '@common/guard';
import { CreateAdvertiserUseCase, GetAdvertisersUseCase, UpdateAdvertiserUseCase } from '@advertiser/use-case';
import { CreateAdvertiserInput, UpdateAdvertiserInput } from '@advertiser/dto/request';
import { Advertiser } from '@advertiser/dto/response';

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
		return await this.createAdvertiserUseCase.execute(input);
	}

	@Mutation(() => Advertiser)
	async updateAdvertiser(@Args('input') input: UpdateAdvertiserInput) {
		return await this.updateAdvertiserUseCase.execute(input);
	}
}
