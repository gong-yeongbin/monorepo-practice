// ReservationScheduler가 부트 시·정각 틱에서 use-case에 위임하는지 검증
import { ConfigService } from '@nestjs/config';
import { ReservationScheduler } from './reservation.scheduler';
import { ApplyDueReservationsUseCase } from '@reservation/application/apply-due-reservations.use-case';

describe('ReservationScheduler', () => {
	const useCase = { execute: jest.fn() } as unknown as ApplyDueReservationsUseCase;

	const createScheduler = (role?: string) => new ReservationScheduler(useCase, { get: jest.fn().mockReturnValue(role) } as unknown as ConfigService);

	beforeEach(() => jest.clearAllMocks());

	it('부트 시 1회 즉시 실행한다 (재기동 소급 적용)', async () => {
		await createScheduler().onApplicationBootstrap();
		expect(useCase.execute).toHaveBeenCalledWith(expect.any(Date));
	});

	it('정각 틱에서 현재 시각으로 실행한다', async () => {
		await createScheduler().handleCron();
		expect(useCase.execute).toHaveBeenCalledWith(expect.any(Date));
	});

	it('APP_ROLE=consumer면 부트·정각 모두 실행하지 않는다 (API와 이중 실행 방지)', async () => {
		const scheduler = createScheduler('consumer');
		await scheduler.onApplicationBootstrap();
		await scheduler.handleCron();
		expect(useCase.execute).not.toHaveBeenCalled();
	});
});
