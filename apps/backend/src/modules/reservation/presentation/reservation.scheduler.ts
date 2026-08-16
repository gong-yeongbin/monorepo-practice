// 예약 적용 스케줄러 — 예약이 시 단위(HH:00:00)라 매시 정각에 실행하고,
// 정각 사이에 재기동해도 지난 예약이 다음 정각까지 밀리지 않도록 부트 시 1회 즉시 실행한다
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApplyDueReservationsUseCase } from '@reservation/application/apply-due-reservations.use-case';

@Injectable()
export class ReservationScheduler implements OnApplicationBootstrap {
	constructor(private readonly applyDueReservationsUseCase: ApplyDueReservationsUseCase) {}

	async onApplicationBootstrap(): Promise<void> {
		await this.applyDueReservationsUseCase.execute(new Date());
	}

	@Cron(CronExpression.EVERY_HOUR)
	async handleCron(): Promise<void> {
		await this.applyDueReservationsUseCase.execute(new Date());
	}
}
