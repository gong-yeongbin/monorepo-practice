// StreamConsumer의 ack 정책·XAUTOCLAIM 회수·poison pill 폐기·role 게이트·graceful shutdown 검증
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StreamConsumer } from './stream-consumer.service';
import { REDIS_STREAM_CLIENT } from './redis-stream.constants';

describe('StreamConsumer', () => {
	const redis = {
		xgroup: jest.fn(),
		xreadgroup: jest.fn(),
		xautoclaim: jest.fn(),
		xpending: jest.fn(),
		xack: jest.fn(),
		quit: jest.fn(),
		disconnect: jest.fn(),
	};

	const createConsumer = async (env: Record<string, string> = {}) => {
		const module = await Test.createTestingModule({
			providers: [
				StreamConsumer,
				{ provide: REDIS_STREAM_CLIENT, useValue: redis },
				{ provide: ConfigService, useValue: { get: jest.fn((key: string) => env[key]) } },
			],
		}).compile();
		return module.get(StreamConsumer);
	};

	// 루프가 마이크로태스크만으로 무한 회전하지 않도록 기본 xreadgroup은 타이머로 한 틱 양보한다
	const waitLoop = () => new Promise((resolve) => setTimeout(resolve, 20));

	beforeEach(() => {
		jest.clearAllMocks();
		redis.xgroup.mockResolvedValue('OK');
		redis.xautoclaim.mockResolvedValue(['0-0', []]);
		redis.xreadgroup.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(null), 0)));
		redis.xpending.mockResolvedValue([]);
		redis.xack.mockResolvedValue(1);
		redis.quit.mockResolvedValue('OK');
	});

	it('핸들러가 성공하면 배치 ID를 ack한다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockResolvedValue(undefined);
		consumer.register('tracking', handler);
		redis.xreadgroup.mockResolvedValueOnce([
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
		expect(redis.xack).toHaveBeenCalledWith('tracking', 'mecross-system', '1-0', '1-1');
	});

	it('핸들러가 실패하면 ack하지 않는다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockRejectedValueOnce(new Error('db down'));
		consumer.register('tracking', handler);
		redis.xreadgroup.mockResolvedValueOnce([['tracking', [['1-0', ['data', 'm1']]]]]);

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		expect(handler).toHaveBeenCalledWith(['m1']);
		expect(redis.xack).not.toHaveBeenCalled();
	});

	it('XAUTOCLAIM으로 회수한 메시지를 재처리하고 성공 시 ack한다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockResolvedValue(undefined);
		consumer.register('tracking', handler);
		redis.xautoclaim.mockResolvedValueOnce(['0-0', [['5-0', ['data', 'claimed']]]]);
		redis.xpending.mockResolvedValueOnce([['5-0', 'dead-consumer', 60_000, 2]]);

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		expect(handler).toHaveBeenCalledWith(['claimed']);
		expect(redis.xack).toHaveBeenCalledWith('tracking', 'mecross-system', '5-0');
	});

	it('전달 횟수가 임계 이상인 메시지는 핸들러에 넘기지 않고 ack로 폐기한다', async () => {
		const consumer = await createConsumer();
		const handler = jest.fn().mockResolvedValue(undefined);
		consumer.register('tracking', handler);
		redis.xautoclaim.mockResolvedValueOnce(['0-0', [['5-0', ['data', 'poison']]]]);
		redis.xpending.mockResolvedValueOnce([['5-0', 'dead-consumer', 60_000, 3]]);

		await consumer.onApplicationBootstrap();
		await waitLoop();
		await consumer.onApplicationShutdown();

		expect(handler).not.toHaveBeenCalledWith(['poison']);
		expect(redis.xack).toHaveBeenCalledWith('tracking', 'mecross-system', '5-0');
	});

	it('APP_ROLE=api면 소비 루프를 시작하지 않는다', async () => {
		const consumer = await createConsumer({ APP_ROLE: 'api' });
		consumer.register('tracking', jest.fn());

		await consumer.onApplicationBootstrap();
		await consumer.onApplicationShutdown();

		expect(redis.xgroup).not.toHaveBeenCalled();
		expect(redis.xreadgroup).not.toHaveBeenCalled();
	});

	it('REDIS_STREAM_CONSUMER 미설정 시 호스트명·PID 기반 고유 이름을 쓴다', async () => {
		const consumer = await createConsumer();

		expect((consumer as unknown as { consumerName: string }).consumerName).toMatch(/^consumer-.+-\d+$/);
	});

	it('shutdown은 소비 루프 종료를 기다린 뒤 quit한다', async () => {
		const consumer = await createConsumer();
		consumer.register('tracking', jest.fn().mockResolvedValue(undefined));

		await consumer.onApplicationBootstrap();
		await consumer.onApplicationShutdown();

		expect(redis.quit).toHaveBeenCalled();
		expect(redis.disconnect).not.toHaveBeenCalled();
	});
});
