import { Test } from '@nestjs/testing';
import { TrackingModeUseCase } from './tracking-mode.use-case';
import { CACHE_PORT } from '@infra/cache/cache.port';

describe('TrackingModeUseCase', () => {
	const cache = { get: jest.fn(), set: jest.fn() };
	let useCase: TrackingModeUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [TrackingModeUseCase, { provide: CACHE_PORT, useValue: cache }],
		}).compile();

		useCase = module.get(TrackingModeUseCase);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('current — 클릭 경로', () => {
		it('저장된 모드를 읽어 반환한다', async () => {
			cache.get.mockResolvedValue('closed');

			expect(await useCase.current()).toBe('closed');
			expect(cache.get).toHaveBeenCalledWith('tracking:mode');
		});

		it('값이 없으면 열어둔다', async () => {
			cache.get.mockResolvedValue(null);

			expect(await useCase.current()).toBe('open');
		});

		it('로컬 캐시가 살아 있는 동안 Redis를 다시 읽지 않는다', async () => {
			cache.get.mockResolvedValue('half');

			await useCase.current();
			await useCase.current();
			await useCase.current();

			expect(cache.get).toHaveBeenCalledTimes(1);
		});

		it('로컬 캐시가 만료되면 다시 읽는다', async () => {
			jest.useFakeTimers();
			cache.get.mockResolvedValue('open');

			await useCase.current();
			jest.advanceTimersByTime(3001);
			cache.get.mockResolvedValue('closed');

			expect(await useCase.current()).toBe('closed');
			expect(cache.get).toHaveBeenCalledTimes(2);
		});

		it('Redis 장애면 마지막으로 읽은 값으로 버틴다', async () => {
			jest.useFakeTimers();
			cache.get.mockResolvedValue('closed');
			await useCase.current();

			jest.advanceTimersByTime(3001);
			cache.get.mockRejectedValue(new Error('redis down'));

			expect(await useCase.current()).toBe('closed');
		});

		it('최초 조회부터 Redis 장애면 열어둔다 — 플래그를 못 읽었다고 트래킹을 멈추지 않는다', async () => {
			cache.get.mockRejectedValue(new Error('redis down'));

			expect(await useCase.current()).toBe('open');
		});
	});

	describe('read — 어드민 조회', () => {
		it('로컬 캐시를 건너뛰고 매번 저장된 값을 읽는다', async () => {
			cache.get.mockResolvedValue('half');

			await useCase.read();
			await useCase.read();

			expect(cache.get).toHaveBeenCalledTimes(2);
		});

		it('알 수 없는 값은 open으로 정규화한다', async () => {
			cache.get.mockResolvedValue('무언가');

			expect(await useCase.read()).toBe('open');
		});
	});

	describe('change', () => {
		it('모드를 저장한다', async () => {
			await useCase.change('closed');

			const [key, value] = cache.set.mock.calls[0] as [string, string, number];
			expect(key).toBe('tracking:mode');
			expect(value).toBe('closed');
		});

		it('변경한 태스크에는 즉시 반영된다 — Redis를 다시 읽지 않는다', async () => {
			await useCase.change('closed');

			expect(await useCase.current()).toBe('closed');
			expect(cache.get).not.toHaveBeenCalled();
		});
	});
});
