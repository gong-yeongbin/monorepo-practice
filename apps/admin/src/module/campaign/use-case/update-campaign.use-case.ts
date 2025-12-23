import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UpdateCampaignInput } from '@campaign/dto/request';
import { UpdateCampaignDto } from '@campaign/dto';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/symbol';
import { ICampaign } from '@campaign/domain/repositories';
import { Campaign } from '@campaign/dto/response';

@Injectable()
export class UpdateCampaignUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign) {}

	async execute(input: UpdateCampaignInput) {
		const updateCampaignDto = plainToInstance(UpdateCampaignDto, input, { excludeExtraneousValues: true });
		const result = await this.campaignRepository.update(updateCampaignDto);
		return plainToInstance(Campaign, result, { excludeExtraneousValues: true });
	}
}
