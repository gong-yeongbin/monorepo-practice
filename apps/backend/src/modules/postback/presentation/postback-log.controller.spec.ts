// PostbackLogController가 각 라우트를 대응 use-case에 위임하고, payload에서 계산한 광고 스코프를 함께 넘기는지 검증
import { PostbackLogController } from './postback-log.controller';
import { ListInstallPostbacksUseCase } from '@postback/application/list-install-postbacks.use-case';
import { ListEventPostbacksUseCase } from '@postback/application/list-event-postbacks.use-case';
import { ListUnregisteredPostbacksUseCase } from '@postback/application/list-unregistered-postbacks.use-case';
import { ListAdvertisingPostbacksUseCase } from '@postback/application/list-advertising-postbacks.use-case';
import { AccessTokenPayload } from '@auth/application/token.constants';

describe('PostbackLogController', () => {
	const installs = { execute: jest.fn() } as unknown as ListInstallPostbacksUseCase;
	const events = { execute: jest.fn() } as unknown as ListEventPostbacksUseCase;
	const unregistered = { execute: jest.fn() } as unknown as ListUnregisteredPostbacksUseCase;
	const advertising = { execute: jest.fn() } as unknown as ListAdvertisingPostbacksUseCase;
	const controller = new PostbackLogController(installs, events, unregistered, advertising);

	const user: AccessTokenPayload = { sub: 1, email: 'viewer@test.com', role: 'USER', advertising_ids: [1] };
	const admin: AccessTokenPayload = { sub: 2, email: 'ops@test.com', role: 'ADMIN', advertising_ids: [] };

	beforeEach(() => jest.clearAllMocks());

	it('install은 query와 스코프를 위임한다', async () => {
		const query = { token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.install(query, user);
		expect(installs.execute).toHaveBeenCalledWith(query, [1]);
	});

	it('event는 query와 스코프를 위임한다', async () => {
		const query = { token: 'tok', event_name: 'purchase', start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.event(query, user);
		expect(events.execute).toHaveBeenCalledWith(query, [1]);
	});

	it('unregistered는 query와 스코프를 위임한다', async () => {
		const query = { token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.unregistered(query, user);
		expect(unregistered.execute).toHaveBeenCalledWith(query, [1]);
	});

	it('광고 단위 일괄 조회는 query와 스코프를 위임한다', async () => {
		const query = { advertising_id: 1, start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.list(query, user);
		expect(advertising.execute).toHaveBeenCalledWith(query, [1]);
	});

	it('ADMIN은 스코핑 면제라 undefined를 넘긴다', async () => {
		const query = { token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.install(query, admin);
		expect(installs.execute).toHaveBeenCalledWith(query, undefined);
	});
});
