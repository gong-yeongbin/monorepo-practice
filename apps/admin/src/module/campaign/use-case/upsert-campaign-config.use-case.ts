import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpsertCampaignConfigInput } from '@module/campaign/dto/request';
import { CAMPAIGN_CONFIG_REPOSITORY, CAMPAIGN_REPOSITORY } from '@module/campaign/domain/symbol';
import { ICampaign, ICampaignConfig } from '@module/campaign/domain/repositories';

@Injectable()
export class UpsertCampaignConfigUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(CAMPAIGN_CONFIG_REPOSITORY) private readonly campaignConfigRepository: ICampaignConfig
	) {}

	async execute(input: UpsertCampaignConfigInput[]) {}
}
