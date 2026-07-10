// TrackerController가 목록 조회를 use-case에 위임하는지 검증
import { TrackerController } from './tracker.controller';
import { ListTrackerUseCase } from '@tracker/application/list-tracker.use-case';

describe('TrackerController', () => {
	const listTrackerUseCase = { execute: jest.fn() } as unknown as ListTrackerUseCase;
	const controller = new TrackerController(listTrackerUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('getTrackerList는 목록 use-case 결과를 반환한다', async () => {
		const list = [{ id: 1, name: 'appsflyer', tracking_url: 't', install_postback_url: 'i', event_postback_url: 'e' }];
		(listTrackerUseCase.execute as jest.Mock).mockResolvedValue(list);

		expect(await controller.getTrackerList()).toBe(list);
	});
});
