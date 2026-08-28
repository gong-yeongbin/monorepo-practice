// 예약 시각이 지난 예약을 campaign에 적용하는 use-case (스케줄러가 매시 정각·부트 시 호출)
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { campaignCacheKey } from '@common/utils/cache-key.util';
import { RESERVATION_REPOSITORY, ReservationRepository } from '@reservation/domain/reservation.repository';

// 락 보유 중 태스크가 죽어도 같은 시간대 안에서 재시도할 수 있도록 짧게 잡는다.
// 적용 자체는 값 덮어쓰기라 멱등이므로, 이 락은 정합성이 아니라 동시 발사(태스크 N대가 같은 초에 진입)를 막는 장치다.
const CRON_LOCK_TTL = 1000 * 60 * 5;

@Injectable()
export class ApplyDueReservationsUseCase {
	private readonly logger = new Logger(ApplyDueReservationsUseCase.name);

	constructor(
		@Inject(RESERVATION_REPOSITORY) private readonly reservationRepository: ReservationRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort
	) {}

	async execute(now: Date): Promise<void> {
		// 스케줄러는 모든 API 태스크에서 돌므로 하나만 통과시킨다.
		// 키를 시 단위로 버킷팅하는 이유는 부트 시 실행 때문이다 — 고정 키에 긴 TTL을 걸면
		// 정각 직전에 부팅한 태스크가 락을 물고 다음 정각 실행을 통째로 막는다.
		const acquired = await this.cache.setIfAbsent(`reservation-cron:${now.toISOString().slice(0, 13)}`, now.toISOString(), CRON_LOCK_TTL);
		if (!acquired) return;

		const due = await this.reservationRepository.findDue(now);
		if (due.length === 0) return;

		// findDue가 예약 시각 오름차순으로 주므로 하나씩 순서대로 적용한다.
		// 동시에 걸면 같은 캠페인의 예약들이 임의 순서로 커밋되어 구버전이 최종 값이 될 수 있다.
		// 한 건 적용 실패가 나머지 예약 적용을 막지 않도록 실패는 로그로 격리한다.
		for (const reservation of due) {
			try {
				await this.reservationRepository.apply(reservation);
				// 예약의 존재 이유가 "지정 시각 반영"이다. 캐시를 지우지 않으면 트래킹이 TTL 30분 동안
				// 구 tracker_tracking_url로 리다이렉트한다(스냅샷에 담기는 필드다).
				// 적용이 실패하면 DB가 안 바뀌었으므로 캐시도 그대로 두는 게 맞아 catch 앞에 두지 않는다.
				await this.cache.del(campaignCacheKey(reservation.campaign_token));
			} catch (error) {
				this.logger.error(`예약 적용 실패 (id=${reservation.id}): ${String(error)}`);
			}
		}
	}
}
