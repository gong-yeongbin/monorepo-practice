import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/symbol';
import { IAdvertising } from '@advertising/domain/repositories';
import { MEDIA_REPOSITORY } from '@media/domain/symbol';
import { IMedia } from '@media/domain/repositories';
import { CreateCampaignInput } from '@campaign/dto/request';
import { CreateCampaignDto } from '@campaign/dto';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/symbol';
import { ICampaign } from '@campaign/domain/repositories';
import { Campaign } from '@campaign/dto/response';

@Injectable()
export class CreateCampaignUseCase {
	constructor(
		@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising,
		@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMedia,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign
	) {}

	async execute(input: CreateCampaignInput) {
		const advertisingName = input.advertisingName;
		const mediaName = input.mediaName;

		const advertising = await this.advertisingRepository.findByName(advertisingName);
		const media = await this.mediaRepository.findByName(mediaName);

		if (!advertising) throw new NotFoundException(`${advertisingName} not found`);
		if (!media) throw new NotFoundException(`${mediaName} not found`);

		const createCampaignDto = plainToInstance(CreateCampaignDto, input);
		const result = await this.campaignRepository.create(createCampaignDto);
		return plainToInstance(Campaign, result, { excludeExtraneousValues: true });
	}
}
