import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpsertCampaignConfigInput } from '@module/campaign/dto/request';
import { CAMPAIGN_CONFIG_REPOSITORY, CAMPAIGN_REPOSITORY } from '@module/campaign/domain/symbol';
import { ICampaign, ICampaignConfig } from '@module/campaign/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { UpsertCampaignConfigDto } from '@campaign/dto';
import { CampaignConfig } from '@campaign/dto/response';

@Injectable()
export class UpsertCampaignConfigUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(CAMPAIGN_CONFIG_REPOSITORY) private readonly campaignConfigRepository: ICampaignConfig
	) {}

	async execute(campaignId: number, input: UpsertCampaignConfigInput[]) {
		const campaign = await this.campaignRepository.find(campaignId);
		if (!campaign) throw new NotFoundException();

		const result = await Promise.all(
			input.map(async (campaignConfig) => {
				const upsertCampaignConfig = plainToInstance(UpsertCampaignConfigDto, { campaignId, ...campaignConfig }, { excludeExtraneousValues: true });
				return await this.campaignConfigRepository.upsert(upsertCampaignConfig);
			})
		);

		return plainToInstance(CampaignConfig, result, { excludeExtraneousValues: true });
	}
}
