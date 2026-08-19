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
		expect(cache.set).toHaveBeenCalledWith('campaign:token-1', JSON.stringify(snapshot), expect.any(Number));
		expect(producer.send).toHaveBeenCalledWith('tracking', expect.any(String));
	});

	it('캐시 히트 상태에서 click_id가 다른 두 요청은 각각 자기 click_id가 치환된 URL을 받는다', async () => {
		cache.get.mockResolvedValue(JSON.stringify(snapshot));

		const first = await useCase.execute(plainToInstance(QueryDto, { token: 'token-1', click_id: 'click-A' }));
		const second = await useCase.execute(plainToInstance(QueryDto, { token: 'token-1', click_id: 'click-B' }));

		expect(first).toContain('click=click-A');
		expect(second).toContain('click=click-B');
		expect(campaignRepository.findByToken).not.toHaveBeenCalled();
		expect(producer.send).toHaveBeenCalledTimes(2);
	});

	it('캐시 히트여도 비활성 캠페인이면 NotFoundException을 던지고 클릭을 발행하지 않는다', async () => {
		cache.get.mockResolvedValue(JSON.stringify({ ...snapshot, is_active: false }));

		await expect(useCase.execute(query)).rejects.toThrow(NotFoundException);
		expect(producer.send).not.toHaveBeenCalled();
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
