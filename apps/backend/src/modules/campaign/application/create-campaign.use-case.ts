// advertising의 tracker 정보를 도출해 campaign(+기본 config)을 생성하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Campaign } from '@campaign/domain/campaign.entity';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';
import { CreateCampaignDto } from '@campaign/application/dto/create-campaign.dto';

@Injectable()
export class CreateCampaignUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository) {}

	async execute(dto: CreateCampaignDto): Promise<Campaign> {
		const trackerInfo = await this.campaignRepository.findAdvertisingTracker(dto.advertising_id);
		if (!trackerInfo) {
			throw new NotFoundException('advertising not found');
		}

		const mediaExists = await this.campaignRepository.mediaExists(dto.media_id);
		if (!mediaExists) {
			throw new NotFoundException('media not found');
		}

		return this.campaignRepository.create({
			name: dto.name,
			type: dto.type,
			advertising_id: dto.advertising_id,
			media_id: dto.media_id,
			tracker_name: trackerInfo.tracker_name,
			tracker_tracking_url: trackerInfo.tracker_tracking_url,
		});
	}
}
