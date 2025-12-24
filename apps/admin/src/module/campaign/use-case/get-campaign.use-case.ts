import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '@module/campaign/domain/symbol';
import { ICampaign } from '@module/campaign/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { Campaign } from '@campaign/dto/response';

@Injectable()
export class GetCampaignUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign) {}

	async execute(id: number) {
		const campaign = await this.campaignRepository.find(id);
		if (!campaign) throw new NotFoundException();

		return plainToInstance(Campaign, campaign, { excludeExtraneousValues: true });
	}
}
