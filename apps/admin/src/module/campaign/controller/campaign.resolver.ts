import { CreateCampaignUseCase, GetCampaignUseCase, UpdateCampaignUseCase, UpsertCampaignConfigUseCase } from '@campaign/use-case';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Campaign, CampaignConfig } from '@campaign/dto/response';
import { CreateCampaignInput, UpdateCampaignInput, UpsertCampaignConfigInput } from '@campaign/dto/request';

@Resolver(() => Campaign)
export class CampaignResolver {
	constructor(
		private readonly createCampaignUseCase: CreateCampaignUseCase,
		private readonly updateCampaignUseCase: UpdateCampaignUseCase,
		private readonly getCampaignUseCase: GetCampaignUseCase,
		private readonly upsertCampaignConfigUseCase: UpsertCampaignConfigUseCase
	) {}

	@Query(() => Campaign, { name: 'campaign' })
	async findOne(@Args('id', { type: () => Int }) id: number) {
		return await this.getCampaignUseCase.execute(id);
	}

	@Mutation(() => Campaign)
	async createCampaign(@Args('input') input: CreateCampaignInput) {
		return await this.createCampaignUseCase.execute(input);
	}

	@Mutation(() => Campaign)
	async updateCampaign(@Args('input') input: UpdateCampaignInput) {
		return await this.updateCampaignUseCase.execute(input);
	}
}
