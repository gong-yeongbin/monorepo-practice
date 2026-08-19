// campaign 정보(name·type·media_id·is_active)를 부분 수정하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Campaign } from '@campaign/domain/campaign.entity';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';
import { UpdateCampaignDto } from '@campaign/application/dto/update-campaign.dto';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { campaignCacheKey } from '@common/utils/cache-key.util';

@Injectable()
export class UpdateCampaignUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort
	) {}

	async execute(id: number, dto: UpdateCampaignDto): Promise<Campaign> {
		const campaign = await this.campaignRepository.findById(id);
		if (!campaign) {
			throw new NotFoundException();
		}

		if (dto.media_id !== undefined && !(await this.campaignRepository.mediaExists(dto.media_id))) {
			throw new NotFoundException('media not found');
		}

		const updated = await this.campaignRepository.update(id, {
			name: dto.name,
			type: dto.type,
			media_id: dto.media_id,
			is_active: dto.is_active,
		});

		// 트래킹 경로가 token 단위로 캐시한 캠페인 스냅샷을 무효화한다
		await this.cache.del(campaignCacheKey(campaign.token));

		return updated;
	}
}
