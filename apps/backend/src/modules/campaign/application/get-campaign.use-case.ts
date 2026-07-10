// campaign 단건을 조회하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Campaign } from '@campaign/domain/campaign.entity';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';

@Injectable()
export class GetCampaignUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository) {}

	async execute(id: number): Promise<Campaign> {
		const campaign = await this.campaignRepository.findById(id);
		if (!campaign) {
			throw new NotFoundException();
		}

		return campaign;
	}
}
