// campaign의 이벤트 매핑(campaign_config)을 전체 교체하는 use-case(admin patchRegisteredEvent 대응)
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';
import { ReplaceConfigDto } from '@campaign/application/dto/replace-config.dto';

@Injectable()
export class ReplaceConfigUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository) {}

	async execute(campaign_id: number, configs: ReplaceConfigDto[]): Promise<void> {
		const campaign = await this.campaignRepository.findById(campaign_id);
		if (!campaign) {
			throw new NotFoundException();
		}

		await this.campaignRepository.replaceConfigs(campaign_id, configs);
	}
}
