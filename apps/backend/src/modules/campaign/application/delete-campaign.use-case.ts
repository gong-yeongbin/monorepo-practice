// campaign을 삭제하는 use-case(campaign_config는 스키마상 Cascade)
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';

@Injectable()
export class DeleteCampaignUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository) {}

	async execute(id: number): Promise<void> {
		const campaign = await this.campaignRepository.findById(id);
		if (!campaign) {
			throw new NotFoundException();
		}

		await this.campaignRepository.delete(id);
	}
}
