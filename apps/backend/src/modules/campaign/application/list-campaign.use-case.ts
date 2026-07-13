// advertising에 속한 campaign 목록을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignListRow, CampaignRepository } from '@campaign/domain/campaign.repository';

@Injectable()
export class ListCampaignUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository) {}

	async execute(advertising_id: number): Promise<CampaignListRow[]> {
		return this.campaignRepository.findByAdvertisingId(advertising_id);
	}
}
