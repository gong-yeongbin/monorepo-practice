import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCampaignDto } from '@module/campaign/dto/request/create-campaign.dto';
import { CAMPAIGN_REPOSITORY } from '@module/campaign/domain/symbol';
import { ICampaign } from '@module/campaign/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { CampaignDto } from '@module/campaign/dto/campaign.dto';
import { ResponseCreateCampaignDto } from '@module/campaign/dto/response';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/symbol';
import { IAdvertising } from '@advertising/domain/repositories';
import { TRACKER_REPOSITORY } from '@module/tracker/domain/symbol';
import { ITracker } from '@module/tracker/domain/repositories';
import { MEDIA_REPOSITORY } from '@media/domain/symbol';
import { IMedia } from '@media/domain/repositories';

@Injectable()
export class CreateCampaignUseCase {
	constructor(
		@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker,
		@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: IAdvertising,
		@Inject(MEDIA_REPOSITORY) private readonly mediaRepository: IMedia,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign
	) {}

	async execute(body: CreateCampaignDto) {
		const trackerName = body.trackerName;
		const advertisingName = body.advertisingName;
		const mediaName = body.mediaName;

		const trakcer = await this.trackerRepository.findByName(trackerName);
		const advertising = await this.advertisingRepository.findByName(advertisingName);
		const media = await this.mediaRepository.findByName(mediaName);

		if (!trakcer) throw new NotFoundException(`${trackerName} not found`);
		if (!advertising) throw new NotFoundException(`${advertisingName} not found`);
		if (!media) throw new NotFoundException(`${mediaName} not found`);

		const campaign = plainToInstance(CampaignDto, body);
		const result = await this.campaignRepository.create(campaign);
		return { data: plainToInstance(ResponseCreateCampaignDto, result) };
	}
}
