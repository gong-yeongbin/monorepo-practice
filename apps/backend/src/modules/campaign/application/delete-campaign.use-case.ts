// campaign을 삭제하는 use-case(campaign_config는 스키마상 Cascade)
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { campaignCacheKey } from '@common/utils/cache-key.util';

@Injectable()
export class DeleteCampaignUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort
	) {}

	async execute(id: number): Promise<void> {
		const campaign = await this.campaignRepository.findById(id);
		if (!campaign) {
			throw new NotFoundException();
		}

		await this.campaignRepository.delete(id);

		// 트래킹 경로가 token 단위로 캐시한 캠페인 스냅샷을 무효화한다
		await this.cache.del(campaignCacheKey(campaign.token));
	}
}
