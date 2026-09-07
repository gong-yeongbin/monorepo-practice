import { Inject, Injectable } from '@nestjs/common';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { DEFAULT_TRACKING_MODE, parseTrackingMode, TrackingMode } from '@tracking/domain/tracking-mode.entity';
import { TRACKING_MODE_CACHE_KEY } from '@common/utils/cache-key.util';

// 모드 값을 태스크 메모리에 들고 있는 기간.
// 클릭마다 Redis를 왕복하면 이 경로에서 아끼고 있는 비용과 맞지 않는다.
// 대가는 반영 지연 — 어드민에서 바꾼 값이 최대 이 시간만큼 늦게 먹는다.
const LOCAL_CACHE_MS = 3000;

// 저장은 TTL 없이 유지한다 — 점검이 언제 끝날지 모르는데 값이 저절로 풀리면 안 된다.
// CachePort.set이 TTL을 요구하므로 충분히 긴 값(30일)을 준다.
const MODE_TTL = 1000 * 60 * 60 * 24 * 30;

@Injectable()
export class TrackingModeUseCase {
	// 마지막으로 읽어낸 값. Redis 장애 시 이 값으로 버틴다.
	private cached: TrackingMode = DEFAULT_TRACKING_MODE;
	private cachedUntil = 0;

	constructor(@Inject(CACHE_PORT) private readonly cache: CachePort) {}

	// 클릭 경로에서 호출된다 — 로컬 캐시가 살아 있으면 Redis를 건드리지 않는다.
	async current(): Promise<TrackingMode> {
		if (this.cachedUntil > Date.now()) return this.cached;

		try {
			this.cached = parseTrackingMode(await this.cache.get(TRACKING_MODE_CACHE_KEY));
		} catch {
			// Redis 장애 — 마지막으로 읽은 값을 그대로 쓴다(최초 실패면 open).
			// 차단 플래그를 못 읽었다고 트래킹을 멈추지 않는다.
		}
		this.cachedUntil = Date.now() + LOCAL_CACHE_MS;
		return this.cached;
	}

	// 어드민 조회 — 로컬 캐시를 건너뛰고 실제 저장된 값을 본다.
	async read(): Promise<TrackingMode> {
		return parseTrackingMode(await this.cache.get(TRACKING_MODE_CACHE_KEY));
	}

	async change(mode: TrackingMode): Promise<void> {
		await this.cache.set(TRACKING_MODE_CACHE_KEY, mode, MODE_TTL);
		// 바꾼 태스크만이라도 즉시 반영한다. 다른 태스크는 로컬 캐시가 만료되면 따라온다.
		this.cached = mode;
		this.cachedUntil = Date.now() + LOCAL_CACHE_MS;
	}
}
