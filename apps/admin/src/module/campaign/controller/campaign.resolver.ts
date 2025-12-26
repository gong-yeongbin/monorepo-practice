import {
	CreateCampaignUseCase,
	GetCampaignConfigUseCase,
	GetCampaignUseCase,
	GetDailyStatisticListUseCase,
	UpdateCampaignUseCase,
	UpsertCampaignConfigUseCase,
} from '@campaign/use-case';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Campaign, CampaignConfig, DailyStatistic } from '@campaign/dto/response';
import { CreateCampaignInput, GetDailyStatisticInput, UpdateCampaignInput, UpsertCampaignConfigInput } from '@campaign/dto/request';

@Resolver(() => Campaign)
export class CampaignResolver {
	constructor(
		private readonly createCampaignUseCase: CreateCampaignUseCase,
		private readonly updateCampaignUseCase: UpdateCampaignUseCase,
		private readonly getCampaignUseCase: GetCampaignUseCase,
		private readonly getCampaignConfigUseCase: GetCampaignConfigUseCase,
		private readonly upsertCampaignConfigUseCase: UpsertCampaignConfigUseCase,
		private readonly getDailyStatisticListUseCase: GetDailyStatisticListUseCase
	) {}

	@Query(() => Campaign, { name: 'campaign' })
	async findOne(@Args('id', { type: () => Int }) id: number) {
		return await this.getCampaignUseCase.execute(id);
	}

	@ResolveField(() => [CampaignConfig])
	async config(@Parent() campaign: Campaign) {
		return await this.getCampaignConfigUseCase.execute(campaign.id);
	}

	@ResolveField(() => [DailyStatistic])
	async dailyStatistic(@Parent() campaign: Campaign, @Args('input') input: GetDailyStatisticInput) {
		return await this.getDailyStatisticListUseCase.execute(campaign.token, input);
	}

	@Mutation(() => Campaign)
	async createCampaign(@Args('input') input: CreateCampaignInput) {
		return await this.createCampaignUseCase.execute(input);
	}

	@Mutation(() => Campaign)
	async updateCampaign(@Args('input') input: UpdateCampaignInput) {
		return await this.updateCampaignUseCase.execute(input);
	}

	@Mutation(() => [CampaignConfig])
	async upsertCampaignConfig(
		@Args('campaignId', { type: () => Int }) campaignId: number,
		@Args('input', { type: () => [UpsertCampaignConfigInput] }) input: UpsertCampaignConfigInput[]
	) {
		return await this.upsertCampaignConfigUseCase.execute(campaignId, input);
	}
}
