// advertising에 속한 campaign 목록을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { ADVERTISING_REPOSITORY, AdvertisingRepository, CampaignListRow } from '@advertising/domain/advertising.repository';

@Injectable()
export class CampaignListUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(advertising_id: number): Promise<CampaignListRow[]> {
		return this.advertisingRepository.campaignList(advertising_id);
	}
}
