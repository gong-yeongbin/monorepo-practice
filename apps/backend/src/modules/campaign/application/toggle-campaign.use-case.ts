// campaign의 is_active를 토글하는 use-case(admin status 토글 대응)
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';

@Injectable()
export class ToggleCampaignUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository) {}

	async execute(id: number): Promise<void> {
		const campaign = await this.campaignRepository.findById(id);
		if (!campaign) {
			throw new NotFoundException();
		}

		await this.campaignRepository.setActive(id, !campaign.is_active);
	}
}
