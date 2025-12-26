import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Campaign } from '@campaign/dto/response';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/symbol';
import { IAdvertising } from '@advertising/domain/repositories';

@Injectable()
export class GetCampaignListUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising) {}

	async execute(id: number) {
		const campaignList = await this.advertisingRepository.findManyCampaign(id);

		return campaignList.map((campaign) => plainToInstance(Campaign, campaign, { excludeExtraneousValues: true }));
	}
}
