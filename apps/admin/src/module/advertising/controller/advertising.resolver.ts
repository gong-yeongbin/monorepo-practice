import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
	CreateAdvertisingUseCase,
	GetAdvertiserUseCase,
	GetAdvertisingListUseCase,
	GetAdvertisingUseCase,
	GetCampaignUseCase,
	GetDailyStatisticUseCase,
	GetTrackerUseCase,
	UpdateAdvertisingUseCase,
} from '@module/advertising/use-case';
import { Advertising } from '@advertising/dto/response';
import { CreateAdvertisingInput, UpdateAdvertisingInput } from '@advertising/dto/request';
import { Campaign, DailyStatistic } from '@campaign/dto/response';
import { Advertiser } from '@advertiser/dto/response';
import { Tracker } from '@tracker/dto/response';

@Resolver(() => Advertising)
export class AdvertisingResolver {
	constructor(
		private readonly createAdvertisingUseCase: CreateAdvertisingUseCase,
		private readonly updateAdvertisingUseCase: UpdateAdvertisingUseCase,
		private readonly getAdvertisingListUseCase: GetAdvertisingListUseCase,
		private readonly getAdvertiserUseCase: GetAdvertiserUseCase,
		private readonly getTrackerUseCase: GetTrackerUseCase,
		private readonly getAdvertisingUseCase: GetAdvertisingUseCase,
		private readonly getCampaignUseCase: GetCampaignUseCase,
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

	@Mutation(() => Advertising)
	async createAdvertising(@Args('input') input: CreateAdvertisingInput) {
		return await this.createAdvertisingUseCase.execute(input);
	}

	@Mutation(() => Advertising)
	async updateAdvertising(@Args('input') input: UpdateAdvertisingInput) {
		return await this.updateAdvertisingUseCase.execute(input);
	}

	@ResolveField(() => String)
	async advertiser(@Parent() advertising: Advertising) {
		return await this.getAdvertiserUseCase.execute(advertising.advertiserId);
	}

	@ResolveField(() => String)
	async tracker(@Parent() advertising: Advertising) {
		return await this.getTrackerUseCase.execute(advertising.trackerId);
	}

	@ResolveField(() => [Campaign])
	async campaign(@Parent() advertising: Advertising) {
		return await this.getCampaignUseCase.execute(advertising.id);
	}

	@ResolveField(() => [DailyStatistic])
	async dailyStatistic(@Parent() advertising: Advertising, @Args('baseDate', { type: () => Date }) baseDate: Date) {
		return await this.getDailyStatisticUseCase.execute(advertising.id, baseDate);
	}
}
