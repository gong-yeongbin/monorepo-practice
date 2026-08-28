import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@tracking/domain/campaign.repository';
import { CampaignSnapshot } from '@tracking/domain/campaign.entity';
import { QueryDto } from '@tracking/application/dto/query.dto';
import { TRACKERS } from '@trackers/tracker.registry';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { StreamProducer } from '@infra/stream/stream-producer.service';
import { viewCodeCodec } from '@common/utils/view-code.util';
import { campaignCacheKey } from '@common/utils/cache-key.util';

// 보관 기간(Redis TTL)과 신선도 기간을 분리한다. 둘이 같으면 만료 즉시 키가 사라져
// RDS 장애 때 기댈 값이 남지 않는다 — RDS는 single-AZ라 그 시간이 곧 클릭 유실이다.
const CAMPAIGN_CACHE_TTL = 1000 * 60 * 60 * 24;
const CAMPAIGN_FRESH_MS = 1000 * 60 * 30;

// DB 갱신에 실패했을 때 다음 재시도까지의 간격.
// 이게 없으면 만료된 토큰마다 매 요청이 죽어가는 DB에 연결을 시도해 복구를 방해하고,
// 연결 타임아웃만큼 요청이 물려 큐가 쌓인다. 캐시가 서킷 브레이커 역할을 한다.
const DB_ERROR_RETRY_MS = 1000 * 30;

// 캐시에 담기는 형태 — 스냅샷 + 언제까지 DB를 다시 읽지 않고 믿을지.
// fresh_until이 없는 구 버전 캐시 값은 비교가 false가 되어 자연히 갱신 경로를 탄다.
type CachedSnapshot = CampaignSnapshot & { fresh_until: number };

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

		const snapshot = await this.getSnapshot(token);

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

	// 신선하면 그대로 쓰고, 아니면 DB에서 갱신한다.
	// DB가 장애면 만료된 스냅샷이라도 내보낸다 — 구 URL로 보내는 편이 아무것도 못 보내는 것보다 낫다.
	private async getSnapshot(token: string): Promise<CampaignSnapshot> {
		const cached = await this.readCache(token);
		if (cached && cached.fresh_until > Date.now()) return cached;

		try {
			return await this.loadAndCacheSnapshot(token);
		} catch (error) {
			// 캠페인이 없어서 난 404는 stale로 되살리지 않는다 — 삭제된 캠페인을 계속 태우게 된다.
			// (삭제·수정·예약 적용은 모두 캐시를 지우므로 정상 경로에서는 값이 남지도 않는다)
			if (!cached || error instanceof NotFoundException) throw error;

			await this.writeCache(token, cached, DB_ERROR_RETRY_MS);
			return cached;
		}
	}

	private async readCache(token: string): Promise<CachedSnapshot | null> {
		const cached = await this.cache.get(campaignCacheKey(token));
		if (!cached) return null;
		try {
			return JSON.parse(cached) as CachedSnapshot;
		} catch {
			// 파싱 불가한 캐시 값은 미스로 취급해 DB에서 다시 읽는다
			return null;
		}
	}

	private async writeCache(token: string, snapshot: CampaignSnapshot, freshMs: number): Promise<void> {
		const entry: CachedSnapshot = { ...snapshot, fresh_until: Date.now() + freshMs };
		await this.cache.set(campaignCacheKey(token), JSON.stringify(entry), CAMPAIGN_CACHE_TTL);
	}

	private async loadAndCacheSnapshot(token: string): Promise<CampaignSnapshot> {
		const campaign = await this.campaignRepository.findByToken(token);
		if (!campaign) throw new NotFoundException();

		const snapshot: CampaignSnapshot = {
			tracker_name: campaign.tracker_name,
			tracker_tracking_url: campaign.tracker_tracking_url,
			is_active: campaign.is_active,
		};
		await this.writeCache(token, snapshot, CAMPAIGN_FRESH_MS);
		return snapshot;
	}
}
