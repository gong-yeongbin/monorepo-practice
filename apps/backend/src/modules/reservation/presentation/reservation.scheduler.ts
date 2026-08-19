// 예약 적용 스케줄러 — 예약이 시 단위(HH:00:00)라 매시 정각에 실행하고,
// 정각 사이에 재기동해도 지난 예약이 다음 정각까지 밀리지 않도록 부트 시 1회 즉시 실행한다
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ApplyDueReservationsUseCase } from '@reservation/application/apply-due-reservations.use-case';

@Injectable()
export class ReservationScheduler implements OnApplicationBootstrap {
	constructor(
		private readonly applyDueReservationsUseCase: ApplyDueReservationsUseCase,
		private readonly configService: ConfigService
	) {}

	// 컨슈머 프로세스(APP_ROLE=consumer)에서는 실행하지 않는다 — API와 이중 실행 방지
	private get enabled(): boolean {
		return (this.configService.get<string>('APP_ROLE') || 'all') !== 'consumer';
	}

	async onApplicationBootstrap(): Promise<void> {
		if (!this.enabled) return;
		await this.applyDueReservationsUseCase.execute(new Date());
	}

	@Cron(CronExpression.EVERY_HOUR)
	async handleCron(): Promise<void> {
		if (!this.enabled) return;
		await this.applyDueReservationsUseCase.execute(new Date());
	}
}
