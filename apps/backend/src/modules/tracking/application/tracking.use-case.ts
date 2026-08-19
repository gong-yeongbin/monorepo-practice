import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@tracking/domain/campaign.repository';
import { CampaignSnapshot } from '@tracking/domain/campaign.entity';
import { QueryDto } from '@tracking/application/dto/query.dto';
import { TRACKERS } from '@trackers/tracker.registry';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { StreamProducer } from '@infra/stream/stream-producer.service';
import { viewCodeCodec } from '@common/utils/view-code.util';
import { campaignCacheKey } from '@common/utils/cache-key.util';

const CAMPAIGN_CACHE_TTL = 1000 * 60 * 30;

@Injectable()
export class TrackingUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort,
		private readonly producer: StreamProducer
	) {}

	async execute(query: QueryDto): Promise<string> {
		const { token } = query;
		const viewCode = viewCodeCodec.encode(`${token}:${query.pubId ?? ''}:${query.subId ?? ''}`);

		const snapshot = (await this.getCachedSnapshot(token)) ?? (await this.loadAndCacheSnapshot(token));

		// 비활성 캠페인은 리다이렉트도 클릭 집계(XADD)도 하지 않는다
		if (!snapshot.is_active) throw new NotFoundException();

		const tracker = TRACKERS[snapshot.tracker_name];
		if (!tracker) throw new NotFoundException();

		// click_id·adid 등 요청별 파라미터가 다른 요청에 섞이지 않도록 완성 URL은 캐시하지 않고 매 요청 치환한다
		const params = tracker.tracking({ ...query, viewCode });
		const url = snapshot.tracker_tracking_url.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '');

		await this.producer.send('tracking', viewCode);
		return url;
	}

	private async getCachedSnapshot(token: string): Promise<CampaignSnapshot | null> {
		const cached = await this.cache.get(campaignCacheKey(token));
		if (!cached) return null;
		try {
			return JSON.parse(cached) as CampaignSnapshot;
		} catch {
			// 파싱 불가한 캐시 값은 미스로 취급해 DB에서 다시 읽는다
			return null;
		}
	}

	private async loadAndCacheSnapshot(token: string): Promise<CampaignSnapshot> {
		const campaign = await this.campaignRepository.findByToken(token);
		if (!campaign) throw new NotFoundException();

		const snapshot: CampaignSnapshot = {
			tracker_name: campaign.tracker_name,
			tracker_tracking_url: campaign.tracker_tracking_url,
			is_active: campaign.is_active,
		};
		await this.cache.set(campaignCacheKey(token), JSON.stringify(snapshot), CAMPAIGN_CACHE_TTL);
		return snapshot;
	}
}
