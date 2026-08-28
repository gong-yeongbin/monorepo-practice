import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TrackingUseCase } from './tracking.use-case';
import { CAMPAIGN_REPOSITORY } from '@tracking/domain/campaign.repository';
import { CACHE_PORT } from '@infra/cache/cache.port';
import { StreamProducer } from '@infra/stream/stream-producer.service';
import { QueryDto } from '@tracking/application/dto/query.dto';

describe('TrackingUseCase', () => {
	const campaignRepository = { findByToken: jest.fn() };
	const cache = { get: jest.fn(), set: jest.fn() };
	const producer = { send: jest.fn() };
	let useCase: TrackingUseCase;

	const query = plainToInstance(QueryDto, { token: 'token-1', click_id: 'click-1', pub_id: 'pub-1', sub_id: 'sub-1', adid: 'adid-1' });

	const snapshot = {
		tracker_name: 'appsflyer',
		tracker_tracking_url: 'https://example.com?cid={af_c_id}&click={clickid}&none={unknown}',
		is_active: true,
	};

	// 캐시에는 스냅샷 + 신선도 만료 시각이 담긴다. fresh_until이 지났으면 DB에서 갱신을 시도한다.
	const cachedAs = (value: object, freshUntil: number) => JSON.stringify({ ...value, fresh_until: freshUntil });
	const fresh = (value: object = snapshot) => cachedAs(value, Date.now() + 60_000);
	const stale = (value: object = snapshot) => cachedAs(value, Date.now() - 60_000);

	// jest mock 인자는 any라 캐시에 저장된 값을 꺼내는 지점에서 한 번만 좁힌다
	const savedCacheEntry = () => {
		const [key, value, ttl] = cache.set.mock.calls[0] as [string, string, number];
		return { key, ttl, entry: JSON.parse(value) as Record<string, unknown> & { fresh_until: number } };
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [
				TrackingUseCase,
				{ provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
				{ provide: CACHE_PORT, useValue: cache },
				{ provide: StreamProducer, useValue: producer },
			],
		}).compile();

		useCase = module.get(TrackingUseCase);
	});

	it('트래킹 URL의 플레이스홀더를 치환하고 캠페인 스냅샷 캐시 저장·클릭 발행을 수행한다', async () => {
		cache.get.mockResolvedValue(undefined);
		campaignRepository.findByToken.mockResolvedValue({ ...snapshot, campaign_config: [] });

		const url = await useCase.execute(query);

		expect(url).toBe('https://example.com?cid=token-1&click=click-1&none=');
		// 완성 URL이 아니라 캠페인 스냅샷(JSON)이 token 키로 캐시되어야 한다
		const { key, ttl, entry } = savedCacheEntry();
		expect(key).toBe('campaign:token-1');
		expect(entry).toMatchObject(snapshot);
		// 보관은 24시간, 신선도는 30분 — 둘이 분리되어야 DB 장애 때 기댈 값이 남는다
		expect(ttl).toBe(1000 * 60 * 60 * 24);
		expect(entry.fresh_until).toBeGreaterThan(Date.now() + 1000 * 60 * 29);
		expect(producer.send).toHaveBeenCalledWith('tracking', expect.any(String));
	});

	it('캐시 히트 상태에서 click_id가 다른 두 요청은 각각 자기 click_id가 치환된 URL을 받는다', async () => {
		cache.get.mockResolvedValue(fresh());

		const first = await useCase.execute(plainToInstance(QueryDto, { token: 'token-1', click_id: 'click-A' }));
		const second = await useCase.execute(plainToInstance(QueryDto, { token: 'token-1', click_id: 'click-B' }));

		expect(first).toContain('click=click-A');
		expect(second).toContain('click=click-B');
		expect(campaignRepository.findByToken).not.toHaveBeenCalled();
		expect(producer.send).toHaveBeenCalledTimes(2);
	});

	it('캐시 히트여도 비활성 캠페인이면 NotFoundException을 던지고 클릭을 발행하지 않는다', async () => {
		cache.get.mockResolvedValue(fresh({ ...snapshot, is_active: false }));

		await expect(useCase.execute(query)).rejects.toThrow(NotFoundException);
		expect(campaignRepository.findByToken).not.toHaveBeenCalled();
		expect(producer.send).not.toHaveBeenCalled();
	});

	it('신선도가 지났으면 캐시 값이 있어도 DB에서 다시 읽는다', async () => {
		cache.get.mockResolvedValue(stale());
		campaignRepository.findByToken.mockResolvedValue({ ...snapshot, tracker_tracking_url: 'https://new.example.com', campaign_config: [] });

		expect(await useCase.execute(query)).toBe('https://new.example.com');
		expect(campaignRepository.findByToken).toHaveBeenCalledWith('token-1');
	});

	it('신선도가 지났고 DB가 장애면 만료된 스냅샷으로 리다이렉트한다', async () => {
		cache.get.mockResolvedValue(stale());
		campaignRepository.findByToken.mockRejectedValue(new Error('db down'));

		// 구 URL로라도 보낸다 — 리다이렉트 실패는 곧 클릭 유실이다
		expect(await useCase.execute(query)).toBe('https://example.com?cid=token-1&click=click-1&none=');
		expect(producer.send).toHaveBeenCalledTimes(1);
	});

	it('DB 장애로 stale을 쓸 때 짧은 신선도로 되찍어 매 요청이 DB를 때리지 않게 한다', async () => {
		cache.get.mockResolvedValue(stale());
		campaignRepository.findByToken.mockRejectedValue(new Error('db down'));

		await useCase.execute(query);

		const { entry } = savedCacheEntry();
		// 30초짜리 재시도 간격 — 30분이 아니다
		expect(entry.fresh_until).toBeLessThan(Date.now() + 1000 * 60);
		expect(entry.fresh_until).toBeGreaterThan(Date.now());
	});

	it('DB가 캠페인 없음을 응답하면 stale을 쓰지 않고 404를 던진다', async () => {
		cache.get.mockResolvedValue(stale());
		campaignRepository.findByToken.mockResolvedValue(null);

		// 삭제된 캠페인을 stale로 되살리면 안 된다
		await expect(useCase.execute(query)).rejects.toThrow(NotFoundException);
		expect(producer.send).not.toHaveBeenCalled();
	});

	it('fresh_until이 없는 구 버전 캐시 값은 만료로 취급해 DB에서 다시 읽는다', async () => {
		cache.get.mockResolvedValue(JSON.stringify(snapshot));
		campaignRepository.findByToken.mockResolvedValue({ ...snapshot, campaign_config: [] });

		await useCase.execute(query);

		expect(campaignRepository.findByToken).toHaveBeenCalledWith('token-1');
	});

	it('캐시 미스에서 비활성 캠페인이면 NotFoundException을 던지고 클릭을 발행하지 않는다', async () => {
		cache.get.mockResolvedValue(undefined);
		campaignRepository.findByToken.mockResolvedValue({ ...snapshot, is_active: false, campaign_config: [] });

		await expect(useCase.execute(query)).rejects.toThrow(NotFoundException);
		expect(producer.send).not.toHaveBeenCalled();
	});

	it('캐시 값이 JSON이 아니면 캐시 미스로 취급해 DB에서 다시 읽는다', async () => {
		cache.get.mockResolvedValue('https://legacy-cached-url.example.com');
		campaignRepository.findByToken.mockResolvedValue({ ...snapshot, campaign_config: [] });

		const url = await useCase.execute(query);

		expect(url).toBe('https://example.com?cid=token-1&click=click-1&none=');
		expect(campaignRepository.findByToken).toHaveBeenCalledWith('token-1');
	});

	it('캠페인이 없으면 NotFoundException을 던지고 클릭을 발행하지 않는다', async () => {
		cache.get.mockResolvedValue(undefined);
		campaignRepository.findByToken.mockResolvedValue(null);

		await expect(useCase.execute(query)).rejects.toThrow(NotFoundException);
		expect(producer.send).not.toHaveBeenCalled();
	});

	it('캠페인의 tracker_name이 등록된 트래커가 아니면 NotFoundException을 던진다', async () => {
		cache.get.mockResolvedValue(undefined);
		campaignRepository.findByToken.mockResolvedValue({
			...snapshot,
			tracker_name: 'unknown-tracker',
			campaign_config: [],
		});

		await expect(useCase.execute(query)).rejects.toThrow(NotFoundException);
		expect(producer.send).not.toHaveBeenCalled();
	});

	it('adbrix-remaster는 adid가 없으면 idfa를 m_adid로 사용한다', async () => {
		cache.get.mockResolvedValue(undefined);
		campaignRepository.findByToken.mockResolvedValue({
			tracker_name: 'adbrix-remaster',
			tracker_tracking_url: 'https://example.com?adid={m_adid}',
			is_active: true,
			campaign_config: [],
		});

		const idfaQuery = plainToInstance(QueryDto, { token: 'token-1', click_id: 'click-1', idfa: 'idfa-1' });
		const url = await useCase.execute(idfaQuery);

		expect(url).toBe('https://example.com?adid=idfa-1');
	});
});
