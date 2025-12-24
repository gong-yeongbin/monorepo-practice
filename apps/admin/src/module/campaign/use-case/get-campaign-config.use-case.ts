import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_CONFIG_REPOSITORY } from '@campaign/domain/symbol';
import { ICampaignConfig } from '@campaign/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { CampaignConfig } from '@campaign/dto/response';

@Injectable()
export class GetCampaignConfigUseCase {
	constructor(@Inject(CAMPAIGN_CONFIG_REPOSITORY) private readonly campaignConfigRepository: ICampaignConfig) {}

	async execute(campaignId: number) {
		const campaignConfig = await this.campaignConfigRepository.findMany(campaignId);
		return campaignConfig.map((config) => plainToInstance(CampaignConfig, config, { excludeExtraneousValues: true }));
	}
}
