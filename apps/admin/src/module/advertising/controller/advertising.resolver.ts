import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
	CreateAdvertisingUseCase,
	GetAdvertisingListUseCase,
	GetAdvertisingUseCase,
	GetCampaignListUseCase,
	GetDailyStatisticUseCase,
	UpdateAdvertisingUseCase,
} from '@module/advertising/use-case';
import { Advertising, DailyStatistic } from '@advertising/dto/response';
import { CreateAdvertisingInput, UpdateAdvertisingInput } from '@advertising/dto/request';
import { Campaign } from '@campaign/dto/response';

@Resolver(() => Advertising)
export class AdvertisingResolver {
	constructor(
		private readonly createAdvertisingUseCase: CreateAdvertisingUseCase,
		private readonly updateAdvertisingUseCase: UpdateAdvertisingUseCase,
		private readonly getAdvertisingListUseCase: GetAdvertisingListUseCase,
		private readonly getAdvertisingUseCase: GetAdvertisingUseCase,
		private readonly getCampaignListUseCase: GetCampaignListUseCase,
		private readonly getDailyStatisticUseCase: GetDailyStatisticUseCase
	) {}

	@Query(() => Advertising, { name: 'advertising' })
	async findOne(@Args('id', { type: () => Int }) id: number) {
		return await this.getAdvertisingUseCase.execute(id);
	}

	@Query(() => [Advertising], { name: 'advertisings' })
	async findAll() {
		return await this.getAdvertisingListUseCase.execute();
	}

	@ResolveField(() => [Campaign])
	async campaign(@Parent() advertising: Advertising) {
		return await this.getCampaignListUseCase.execute(advertising.id);
	}

	@ResolveField(() => [DailyStatistic])
	async dailyStatistic(@Parent() advertising: Advertising, @Args('baseDate', { type: () => Date }) baseDate: Date) {
		return await this.getDailyStatisticUseCase.execute(advertising.id, baseDate);
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
