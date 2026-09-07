import { Test } from '@nestjs/testing';
import { TrackingModeController } from './tracking-mode.controller';
import { TrackingModeUseCase } from '@tracking/application/tracking-mode.use-case';

describe('TrackingModeController', () => {
	const trackingModeUseCase = { read: jest.fn(), change: jest.fn() };
	let controller: TrackingModeController;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			controllers: [TrackingModeController],
			providers: [{ provide: TrackingModeUseCase, useValue: trackingModeUseCase }],
		}).compile();

		controller = module.get(TrackingModeController);
	});

	it('현재 모드를 조회해 반환한다', async () => {
		trackingModeUseCase.read.mockResolvedValue('half');

		expect(await controller.read()).toEqual({ mode: 'half' });
	});

	it('모드 변경을 use-case에 위임한다', async () => {
		await controller.change({ mode: 'closed' });

		expect(trackingModeUseCase.change).toHaveBeenCalledWith('closed');
	});
});
