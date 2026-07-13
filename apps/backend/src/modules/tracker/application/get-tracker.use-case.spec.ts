import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetTrackerUseCase } from './get-tracker.use-case';
import { TRACKER_REPOSITORY } from '@tracker/domain/tracker.repository';

describe('GetTrackerUseCase', () => {
	const trackerRepository = { findById: jest.fn() };
	let useCase: GetTrackerUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [GetTrackerUseCase, { provide: TRACKER_REPOSITORY, useValue: trackerRepository }],
		}).compile();
		useCase = module.get(GetTrackerUseCase);
	});

	it('존재하면 tracker를 반환한다', async () => {
		const tracker = { id: 1, name: 'appsflyer', tracking_url: 't', install_postback_url: 'i', event_postback_url: 'e' };
		trackerRepository.findById.mockResolvedValue(tracker);

		expect(await useCase.execute(1)).toBe(tracker);
	});

	it('없으면 NotFoundException을 던진다', async () => {
		trackerRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
	});
});
