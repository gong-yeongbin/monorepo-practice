// StreamProducer의 XADD 인자(MAXLEN 트림 포함) 검증
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StreamProducer } from './stream-producer.service';
import { REDIS_STREAM_CLIENT, STREAM_MAXLEN_DEFAULT } from './redis-stream.constants';

describe('StreamProducer', () => {
	const redis = { xadd: jest.fn() };

	const createProducer = async (maxlenEnv?: string) => {
		const module = await Test.createTestingModule({
			providers: [
				StreamProducer,
				{ provide: REDIS_STREAM_CLIENT, useValue: redis },
				{ provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(maxlenEnv) } },
			],
		}).compile();
		return module.get(StreamProducer);
	};

	beforeEach(() => jest.clearAllMocks());

	it('기본 MAXLEN으로 approximate 트림을 걸어 발행한다', async () => {
		const producer = await createProducer();

		await producer.send('tracking', 'view-code-1');

		expect(redis.xadd).toHaveBeenCalledWith('tracking', 'MAXLEN', '~', STREAM_MAXLEN_DEFAULT, '*', 'data', 'view-code-1');
	});

	it('REDIS_STREAM_MAXLEN env가 있으면 그 값을 사용한다', async () => {
		const producer = await createProducer('5000');

		await producer.send('postback', 'payload');

		expect(redis.xadd).toHaveBeenCalledWith('postback', 'MAXLEN', '~', 5000, '*', 'data', 'payload');
	});
});
