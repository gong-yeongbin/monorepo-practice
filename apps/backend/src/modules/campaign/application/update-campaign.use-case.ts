// campaign 정보(name·type·media_id·is_active)를 부분 수정하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Campaign } from '@campaign/domain/campaign.entity';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';
import { UpdateCampaignDto } from '@campaign/application/dto/update-campaign.dto';

@Injectable()
export class UpdateCampaignUseCase {
	constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository) {}

	async execute(id: number, dto: UpdateCampaignDto): Promise<Campaign> {
		if (!(await this.campaignRepository.findById(id))) {
			throw new NotFoundException();
		}

		if (dto.media_id !== undefined && !(await this.campaignRepository.mediaExists(dto.media_id))) {
			throw new NotFoundException('media not found');
		}

		return this.campaignRepository.update(id, {
			name: dto.name,
			type: dto.type,
			media_id: dto.media_id,
			is_active: dto.is_active,
		});
	}
}
