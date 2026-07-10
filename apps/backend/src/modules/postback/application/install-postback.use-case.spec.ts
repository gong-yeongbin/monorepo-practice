// install postback use-case가 트래커 매핑·viewCode 디코드·스트림 발행을 수행하는지 검증
import { Test } from '@nestjs/testing';
import { InstallPostbackUseCase } from './install-postback.use-case';
import { StreamProducer } from '@infra/stream/stream-producer.service';
import { TRACKERS } from '@trackers/tracker.registry';
import { viewCodeCodec } from '@common/utils/view-code.util';

jest.mock('@trackers/tracker.registry', () => ({ TRACKERS: {} }));

describe('InstallPostbackUseCase', () => {
	const producer = { send: jest.fn() };
	let useCase: InstallPostbackUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [InstallPostbackUseCase, { provide: StreamProducer, useValue: producer }],
		}).compile();
		useCase = module.get(InstallPostbackUseCase);
	});

	it('viewCode에서 pub_id·sub_id를 추출해 install postback을 발행한다', async () => {
		const viewCode = viewCodeCodec.encode('token-1:pub-9:sub-9');
		(TRACKERS as Record<string, unknown>)['appsflyer'] = {
			install: jest.fn().mockReturnValue({ clickId: 'c', viewCode, token: 'token-1', adid: null, idfa: null, ip: '1.1.1.1', countryCode: 'KR', installedAt: '2026-07-10' }),
		};

		await useCase.execute('appsflyer', { af_c_id: 'token-1' });

		expect(producer.send).toHaveBeenCalledTimes(1);
		const [stream, payload] = producer.send.mock.calls[0];
		expect(stream).toBe('postback');
		const sent = JSON.parse(payload);
		expect(sent.event_name).toBe('install');
		expect(sent.pub_id).toBe('pub-9');
		expect(sent.sub_id).toBe('sub-9');
		expect(sent.tracker_name).toBe('appsflyer');
		expect(sent.raw_query_params).toBe(JSON.stringify({ af_c_id: 'token-1' }));
	});

	it('viewCode에 pub·sub 구분자가 없으면 pub_id·sub_id를 null로 둔다', async () => {
		(TRACKERS as Record<string, unknown>)['appsflyer'] = {
			install: jest.fn().mockReturnValue({ clickId: 'c', viewCode: 'plain', token: 'token-1', adid: null, idfa: null, ip: '1.1.1.1', countryCode: 'KR', installedAt: '2026-07-10' }),
		};

		await useCase.execute('appsflyer', {});

		const sent = JSON.parse(producer.send.mock.calls[0][1]);
		expect(sent.pub_id).toBeNull();
		expect(sent.sub_id).toBeNull();
	});
});
