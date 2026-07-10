import { Test } from '@nestjs/testing';
import { ListTrackerUseCase } from './list-tracker.use-case';
import { TRACKER_REPOSITORY } from '@tracker/domain/tracker.repository';

describe('ListTrackerUseCase', () => {
	const trackerRepository = { findAll: jest.fn() };
	let useCase: ListTrackerUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [ListTrackerUseCase, { provide: TRACKER_REPOSITORY, useValue: trackerRepository }],
		}).compile();

		useCase = module.get(ListTrackerUseCase);
	});

	it('repository의 tracker 목록을 반환한다', async () => {
		const list = [{ id: 1, name: 'appsflyer', tracking_url: 't', install_postback_url: 'i', event_postback_url: 'e' }];
		trackerRepository.findAll.mockResolvedValue(list);

		expect(await useCase.execute()).toBe(list);
	});
});
