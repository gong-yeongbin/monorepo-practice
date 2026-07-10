// campaign에 등록된 이벤트 매핑(campaign_config) 목록을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { CampaignConfig } from '@campaign/domain/campaign.entity';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';

@Injectable()
export class ListConfigUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository) {}

	async execute(campaign_id: number): Promise<CampaignConfig[]> {
		return this.campaignRepository.findConfigs(campaign_id);
	}
}
