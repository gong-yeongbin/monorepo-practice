import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Campaign } from '@campaign/dto/response';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/symbol';
import { ICampaign } from '@campaign/domain/repositories';

@Injectable()
export class GetCampaignListUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign) {}

	async execute(id: number) {
		const campaignList = await this.campaignRepository.findManyByAdvertisingId(id);

		return campaignList.map((campaign) => plainToInstance(Campaign, campaign, { excludeExtraneousValues: true }));
	}
}
