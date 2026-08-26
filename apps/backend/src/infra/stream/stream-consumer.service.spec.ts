// StreamConsumer의 ack 정책·XAUTOCLAIM 회수·poison pill 폐기·role 게이트·graceful shutdown 검증
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StreamConsumer } from './stream-consumer.service';
import { REDIS_STREAM_CLIENT } from './redis-stream.constants';

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
