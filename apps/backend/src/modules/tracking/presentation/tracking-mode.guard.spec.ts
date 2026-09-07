import { Test } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { TrackingModeGuard } from './tracking-mode.guard';
import { TrackingModeUseCase } from '@tracking/application/tracking-mode.use-case';

describe('TrackingModeGuard', () => {
	const trackingModeUseCase = { current: jest.fn() };
	let guard: TrackingModeGuard;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [TrackingModeGuard, { provide: TrackingModeUseCase, useValue: trackingModeUseCase }],
		}).compile();

		guard = module.get(TrackingModeGuard);
	});

	afterEach(() => {
		jest.spyOn(Math, 'random').mockRestore();
	});

	it('open이면 통과시킨다', async () => {
		trackingModeUseCase.current.mockResolvedValue('open');

		await expect(guard.canActivate()).resolves.toBe(true);
	});

	it('closed면 503으로 막는다 — 403(가드 기본값)이 아니다', async () => {
		trackingModeUseCase.current.mockResolvedValue('closed');

		await expect(guard.canActivate()).rejects.toThrow(ServiceUnavailableException);
	});

	it('half에서 난수가 0.5 미만이면 통과시킨다', async () => {
		trackingModeUseCase.current.mockResolvedValue('half');
		jest.spyOn(Math, 'random').mockReturnValue(0.49);

		await expect(guard.canActivate()).resolves.toBe(true);
	});

	it('half에서 난수가 0.5 이상이면 503으로 막는다', async () => {
		trackingModeUseCase.current.mockResolvedValue('half');
		jest.spyOn(Math, 'random').mockReturnValue(0.5);

		await expect(guard.canActivate()).rejects.toThrow(ServiceUnavailableException);
	});
});
