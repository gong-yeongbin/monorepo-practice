// StreamConsumer의 ack 정책·XAUTOCLAIM 회수·poison pill 폐기·role 게이트·graceful shutdown 검증
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StreamConsumer } from './stream-consumer.service';
import { REDIS_STREAM_CLIENT, STREAM_READ_COUNT } from './redis-stream.constants';

describe('StreamConsumer', () => {
	// 소비 명령은 공유 클라이언트가 아니라 duplicate된 블로킹 전용 연결로 나간다
	const blocking = {
		xgroup: jest.fn(),
		xreadgroup: jest.fn(),
		xautoclaim: jest.fn(),
		xpending: jest.fn(),
		xack: jest.fn(),
		quit: jest.fn(),
		disconnect: jest.fn(),
	};

	const redis = {
		duplicate: jest.fn(() => blocking),
		quit: jest.fn(),
		disconnect: jest.fn(),
	};

	// linger는 기본 200ms라 waitLoop(20ms)가 못 기다린다. 배치 병합 자체를 검증하는 케이스가 아니면 1ms로 줄인다.
	const createConsumer = async (env: Record<string, string> = {}) => {
		const module = await Test.createTestingModule({
			providers: [
				StreamConsumer,
				{ provide: REDIS_STREAM_CLIENT, useValue: redis },
				{ provide: ConfigService, useValue: { get: jest.fn((key: string) => ({ STREAM_LINGER_MS: '1', ...env })[key]) } },
			],
		}).compile();
		return module.get(StreamConsumer);
	};

	// 루프가 마이크로태스크만으로 무한 회전하지 않도록 기본 xreadgroup은 타이머로 한 틱 양보한다
	const waitLoop = () => new Promise((resolve) => setTimeout(resolve, 20));

	beforeEach(() => {
		jest.clearAllMocks();
		redis.duplicate.mockReturnValue(blocking);
		redis.quit.mockResolvedValue('OK');
		blocking.xgroup.mockResolvedValue('OK');
		blocking.xautoclaim.mockResolvedValue(['0-0', []]);
		blocking.xreadgroup.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(null), 0)));
		blocking.xpending.mockResolvedValue([]);
		blocking.xack.mockResolvedValue(1);
		blocking.quit.mockResolvedValue('OK');
	});

	it('핸들러가 성공하면 배치 ID를 ack한다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockResolvedValue(undefined);
		consumer.register('tracking', handler);
		blocking.xreadgroup.mockResolvedValueOnce([
			[
				'tracking',
				[
					['1-0', ['data', 'm1']],
					['1-1', ['data', 'm2']],
				],
			],
		]);

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		expect(handler).toHaveBeenCalledWith(['m1', 'm2']);
		expect(blocking.xack).toHaveBeenCalledWith('tracking', 'mecross-system', '1-0', '1-1');
	});

	it('첫 읽기가 COUNT 미만이면 추가로 모아 한 배치로 처리한다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockResolvedValue(undefined);
		consumer.register('tracking', handler);
		blocking.xreadgroup
			.mockResolvedValueOnce([
				[
					'tracking',
					[
						['1-0', ['data', 'm1']],
						['1-1', ['data', 'm2']],
					],
				],
			])
			.mockResolvedValueOnce([['tracking', [['1-2', ['data', 'm3']]]]]);

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		// 두 번의 읽기가 하나의 배치로 합쳐져 핸들러·ack가 각각 한 번씩만 일어난다
		expect(handler).toHaveBeenCalledWith(['m1', 'm2', 'm3']);
		expect(blocking.xack).toHaveBeenCalledWith('tracking', 'mecross-system', '1-0', '1-1', '1-2');
	});

	it('첫 읽기가 COUNT를 채우면 추가 읽기를 하지 않는다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockResolvedValue(undefined);
		consumer.register('tracking', handler);
		const full = Array.from({ length: STREAM_READ_COUNT }, (_, index) => [`1-${index}`, ['data', `m${index}`]]);
		blocking.xreadgroup.mockResolvedValueOnce([['tracking', full]]);

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		expect(handler).toHaveBeenCalledWith(full.map((_, index) => `m${index}`));
		// 추가 읽기는 BLOCK 없이 나가므로 그것만 골라낸다. 상한에 도달했으니 한 번도 없어야 한다.
		expect(blocking.xreadgroup.mock.calls.filter((args: unknown[]) => !args.includes('BLOCK'))).toHaveLength(0);
	});

	it('핸들러가 실패하면 ack하지 않는다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockRejectedValueOnce(new Error('db down'));
		consumer.register('tracking', handler);
		blocking.xreadgroup.mockResolvedValueOnce([['tracking', [['1-0', ['data', 'm1']]]]]);

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		expect(handler).toHaveBeenCalledWith(['m1']);
		expect(blocking.xack).not.toHaveBeenCalled();
	});

	it('XAUTOCLAIM으로 회수한 메시지를 재처리하고 성공 시 ack한다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockResolvedValue(undefined);
		consumer.register('tracking', handler);
		blocking.xautoclaim.mockResolvedValueOnce(['0-0', [['5-0', ['data', 'claimed']]]]);
		blocking.xpending.mockResolvedValueOnce([['5-0', 'dead-consumer', 60_000, 2]]);

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		expect(handler).toHaveBeenCalledWith(['claimed']);
		expect(blocking.xack).toHaveBeenCalledWith('tracking', 'mecross-system', '5-0');
	});

	it('전달 횟수가 임계 이상인 메시지는 핸들러에 넘기지 않고 ack로 폐기한다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockResolvedValue(undefined);
		consumer.register('tracking', handler);
		blocking.xautoclaim.mockResolvedValueOnce(['0-0', [['5-0', ['data', 'poison']]]]);
		blocking.xpending.mockResolvedValueOnce([['5-0', 'dead-consumer', 60_000, 3]]);

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		expect(handler).not.toHaveBeenCalledWith(['poison']);
		expect(blocking.xack).toHaveBeenCalledWith('tracking', 'mecross-system', '5-0');
	});

	// 하나를 공유하면 유입이 없는 스트림의 XREADGROUP BLOCK이 타임아웃을 채우는 동안
	// 다른 스트림의 읽기가 ioredis 연결 큐에서 대기해, 처리량이 유입이 아니라 BLOCK 주기에 묶인다.
	// 지표에 드러나지 않는 종류의 저하라 회귀를 테스트로 막는다.
	it('스트림마다 별도의 블로킹 연결을 만든다', async () => {
		const consumer = await createConsumer();
		consumer.register('tracking', jest.fn().mockResolvedValue(undefined));
		consumer.register('postback', jest.fn().mockResolvedValue(undefined));

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		expect(redis.duplicate).toHaveBeenCalledTimes(2);
	});

	it('APP_ROLE=api면 블로킹 연결을 만들지 않고 소비 루프도 시작하지 않는다', async () => {
		const consumer = await createConsumer({ APP_ROLE: 'api' });
		consumer.register('tracking', jest.fn());

		await consumer.onApplicationBootstrap();
		await consumer.onApplicationShutdown();

		expect(redis.duplicate).not.toHaveBeenCalled();
		expect(blocking.xgroup).not.toHaveBeenCalled();
		expect(blocking.xreadgroup).not.toHaveBeenCalled();
	});

	it('REDIS_STREAM_CONSUMER 미설정 시 호스트명·PID 기반 고유 이름을 쓴다', async () => {
		const consumer = await createConsumer();

		expect((consumer as unknown as { consumerName: string }).consumerName).toMatch(/^consumer-.+-\d+$/);
	});

	it('shutdown은 소비 루프 종료를 기다린 뒤 블로킹·공유 연결을 모두 quit한다', async () => {
		const consumer = await createConsumer();
		consumer.register('tracking', jest.fn().mockResolvedValue(undefined));

		await consumer.onApplicationBootstrap();
		await consumer.onApplicationShutdown();

		expect(blocking.quit).toHaveBeenCalled();
		expect(redis.quit).toHaveBeenCalled();
		expect(blocking.disconnect).not.toHaveBeenCalled();
		expect(redis.disconnect).not.toHaveBeenCalled();
	});
});
