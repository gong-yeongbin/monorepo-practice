// event postback use-case가 트래커 매핑·viewCode 디코드·스트림 발행을 수행하는지 검증
import { Test } from '@nestjs/testing';
import { EventPostbackUseCase } from './event-postback.use-case';
import { StreamProducer } from '@infra/stream/stream-producer.service';
import { TRACKERS } from '@trackers/tracker.registry';
import { viewCodeCodec } from '@common/utils/view-code.util';

jest.mock('@trackers/tracker.registry', () => ({ TRACKERS: {} }));

describe('EventPostbackUseCase', () => {
	const producer = { send: jest.fn() };
	let useCase: EventPostbackUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [EventPostbackUseCase, { provide: StreamProducer, useValue: producer }],
		}).compile();
		useCase = module.get(EventPostbackUseCase);
	});

	it('트래커 event 매핑 결과와 viewCode의 pub·sub를 담아 postback을 발행한다', async () => {
		const viewCode = viewCodeCodec.encode('token-1:pub-9:sub-9');
		(TRACKERS as Record<string, unknown>)['appsflyer'] = {
			event: jest.fn().mockReturnValue({
				clickId: 'c',
				viewCode,
				token: 'token-1',
				adid: null,
				idfa: null,
				ip: '1.1.1.1',
				countryCode: 'KR',
				installedAt: '2026-07-10',
				eventName: 'purchase',
				revenue: '1000',
			}),
		};

		await useCase.execute('appsflyer', { af_c_id: 'token-1', event_name: 'purchase' });

		expect(producer.send).toHaveBeenCalledTimes(1);
		const [stream, payload] = producer.send.mock.calls[0];
		expect(stream).toBe('postback');
		const sent = JSON.parse(payload);
		expect(sent.event_name).toBe('purchase');
		expect(sent.pub_id).toBe('pub-9');
		expect(sent.sub_id).toBe('sub-9');
		expect(sent.revenue).toBe('1000');
	});
});
