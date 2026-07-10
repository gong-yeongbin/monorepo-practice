// PostbackController가 install·event 요청을 각 use-case로 위임하는지 검증
import { PostbackController } from './postback.controller';
import { InstallPostbackUseCase } from '@postback/application/install-postback.use-case';
import { EventPostbackUseCase } from '@postback/application/event-postback.use-case';

describe('PostbackController', () => {
	const installUseCase = { execute: jest.fn() } as unknown as InstallPostbackUseCase;
	const eventUseCase = { execute: jest.fn() } as unknown as EventPostbackUseCase;
	const controller = new PostbackController(installUseCase, eventUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('install 요청을 tracker.name·query로 install use-case에 위임한다', async () => {
		const query = { af_c_id: 'token-1' };
		await controller.install({ name: 'appsflyer' }, query);

		expect(installUseCase.execute).toHaveBeenCalledWith('appsflyer', query);
	});

	it('event 요청을 tracker.name·query로 event use-case에 위임한다', async () => {
		const query = { af_c_id: 'token-1', event_name: 'purchase' };
		await controller.event({ name: 'appsflyer' }, query);

		expect(eventUseCase.execute).toHaveBeenCalledWith('appsflyer', query);
	});
});
