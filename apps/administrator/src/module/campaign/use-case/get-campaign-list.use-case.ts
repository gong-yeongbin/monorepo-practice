import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ADVERTISING_REPOSITORY, IAdvertising } from '@module/advertising/domain';
import { CAMPAIGN_REPOSITORY } from '@module/campaign/domain/symbol';
import { ICampaign } from '@module/campaign/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { ResponseGetCampaignListDto } from '@module/campaign/dto/response/response-get-campaign-list.dto';

@Injectable()
export class GetCampaignListUseCase {
	constructor(
		@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign
	) {}

	async execute(id: number) {
		const advertising = await this.advertisingRepository.findById(id);
		if (!advertising) throw new NotFoundException();

		const campaignList = await this.campaignRepository.findManyByAdvertigingName(advertising.name);
		return {
			data: campaignList.map((advertising) => plainToInstance(ResponseGetCampaignListDto, advertising, { excludeExtraneousValues: true })),
		};
	}
}
