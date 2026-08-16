// ReservationScheduler가 부트 시·정각 틱에서 use-case에 위임하는지 검증
import { ReservationScheduler } from './reservation.scheduler';
import { ApplyDueReservationsUseCase } from '@reservation/application/apply-due-reservations.use-case';

describe('ReservationScheduler', () => {
	const useCase = { execute: jest.fn() } as unknown as ApplyDueReservationsUseCase;
	const scheduler = new ReservationScheduler(useCase);

	beforeEach(() => jest.clearAllMocks());

	it('부트 시 1회 즉시 실행한다 (재기동 소급 적용)', async () => {
		await scheduler.onApplicationBootstrap();
		expect(useCase.execute).toHaveBeenCalledWith(expect.any(Date));
	});

	it('정각 틱에서 현재 시각으로 실행한다', async () => {
		await scheduler.handleCron();
		expect(useCase.execute).toHaveBeenCalledWith(expect.any(Date));
	});
});
