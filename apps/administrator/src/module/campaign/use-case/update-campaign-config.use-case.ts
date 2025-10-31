import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCampaignConfigDto } from '@module/campaign/dto/request';
import { CAMPAIGN_CONFIG_REPOSITORY, CAMPAIGN_REPOSITORY } from '@module/campaign/domain/symbol';
import { ICampaign, ICampaignConfig } from '@module/campaign/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { CampaignConfigDto } from '@module/campaign/dto/campaign-config.dto';

@Injectable()
export class UpdateCampaignConfigUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(CAMPAIGN_CONFIG_REPOSITORY) private readonly campaignConfigRepository: ICampaignConfig
	) {}

	async execute(id: number, body: UpdateCampaignConfigDto) {
		const campaign = await this.campaignRepository.find(id);
		if (!campaign) throw new NotFoundException();

		const campaignConfig = plainToInstance(CampaignConfigDto, body, { excludeExtraneousValues: true });
		return await this.campaignConfigRepository.upsert(campaign.token, campaignConfig);
	}
}
