// PostbackLogController가 각 라우트를 대응 use-case에 위임하는지 검증
import { PostbackLogController } from './postback-log.controller';
import { ListInstallPostbacksUseCase } from '@postback/application/list-install-postbacks.use-case';
import { ListEventPostbacksUseCase } from '@postback/application/list-event-postbacks.use-case';
import { ListUnregisteredPostbacksUseCase } from '@postback/application/list-unregistered-postbacks.use-case';

describe('PostbackLogController', () => {
	const installs = { execute: jest.fn() } as unknown as ListInstallPostbacksUseCase;
	const events = { execute: jest.fn() } as unknown as ListEventPostbacksUseCase;
	const unregistered = { execute: jest.fn() } as unknown as ListUnregisteredPostbacksUseCase;
	const controller = new PostbackLogController(installs, events, unregistered);

	beforeEach(() => jest.clearAllMocks());

	it('install은 query를 위임한다', async () => {
		const query = { token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.install(query);
		expect(installs.execute).toHaveBeenCalledWith(query);
	});

	it('event는 query를 위임한다', async () => {
		const query = { token: 'tok', event_name: 'purchase', start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.event(query);
		expect(events.execute).toHaveBeenCalledWith(query);
	});

	it('unregistered는 query를 위임한다', async () => {
		const query = { token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.unregistered(query);
		expect(unregistered.execute).toHaveBeenCalledWith(query);
	});
});
