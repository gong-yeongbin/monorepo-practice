// 트래킹 모드에 따라 클릭 요청을 통과시키거나 503으로 막는 가드
import { CanActivate, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { TrackingModeUseCase } from '@tracking/application/tracking-mode.use-case';

// half 모드에서 통과시킬 비율
const HALF_PASS_RATE = 0.5;

@Injectable()
export class TrackingModeGuard implements CanActivate {
	constructor(private readonly trackingModeUseCase: TrackingModeUseCase) {}

	async canActivate(): Promise<boolean> {
		const mode = await this.trackingModeUseCase.current();
		if (mode === 'open') return true;
		if (mode === 'half' && Math.random() < HALF_PASS_RATE) return true;

		// 가드가 false를 반환하면 403이 나간다 — 점검·차단은 일시적이라는 뜻의 503으로 명시한다.
		// 500은 쓰지 않는다(트래커 재시도와 장애 알람을 유발한다).
		throw new ServiceUnavailableException();
	}
}
