import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TrackingUseCase } from './tracking.use-case';
import { CAMPAIGN_REPOSITORY } from '@tracking/domain/campaign.repository';
import { CACHE_PORT } from '@infra/cache/cache.port';
import { PRODUCER_PORT } from '@infra/messaging/producer.port';
import { QueryDto } from '@tracking/application/dto/query.dto';

describe('TrackingUseCase', () => {
	const campaignRepository = { findByToken: jest.fn() };
	const cache = { get: jest.fn(), set: jest.fn() };
	const producer = { send: jest.fn() };
	let useCase: TrackingUseCase;

	const query = plainToInstance(QueryDto, { token: 'token-1', click_id: 'click-1', pub_id: 'pub-1', sub_id: 'sub-1', adid: 'adid-1' });

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [
				TrackingUseCase,
				{ provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
				{ provide: CACHE_PORT, useValue: cache },
				{ provide: PRODUCER_PORT, useValue: producer },
			],
		}).compile();

		useCase = module.get(TrackingUseCase);
	});

	it('트래킹 URL의 플레이스홀더를 치환하고 캐시 저장·클릭 발행을 수행한다', async () => {
		cache.get.mockResolvedValue(undefined);
		campaignRepository.findByToken.mockResolvedValue({
			tracker_name: 'appsflyer',
			tracker_tracking_url: 'https://example.com?cid={af_c_id}&click={clickid}&none={unknown}',
			campaign_config: [],
		});

		const url = await useCase.execute(query);

		expect(url).toBe('https://example.com?cid=token-1&click=click-1&none=');
		expect(cache.set).toHaveBeenCalledWith(expect.any(String), url, expect.any(Number));
		expect(producer.send).toHaveBeenCalledWith('tracking', expect.any(String));
	});

	it('캐시에 URL이 있으면 DB 조회 없이 반환하고 클릭은 발행한다', async () => {
		cache.get.mockResolvedValue('https://cached.example.com');

		const url = await useCase.execute(query);

		expect(url).toBe('https://cached.example.com');
		expect(campaignRepository.findByToken).not.toHaveBeenCalled();
		expect(producer.send).toHaveBeenCalledWith('tracking', expect.any(String));
	});

	it('캠페인이 없으면 NotFoundException을 던지고 클릭을 발행하지 않는다', async () => {
		cache.get.mockResolvedValue(undefined);
		campaignRepository.findByToken.mockResolvedValue(null);

		await expect(useCase.execute(query)).rejects.toThrow(NotFoundException);
		expect(producer.send).not.toHaveBeenCalled();
	});

	it('adbrix-remaster는 adid가 없으면 idfa를 m_adid로 사용한다', async () => {
		cache.get.mockResolvedValue(undefined);
		campaignRepository.findByToken.mockResolvedValue({
			tracker_name: 'adbrix-remaster',
			tracker_tracking_url: 'https://example.com?adid={m_adid}',
			campaign_config: [],
		});

		const idfaQuery = plainToInstance(QueryDto, { token: 'token-1', click_id: 'click-1', idfa: 'idfa-1' });
		const url = await useCase.execute(idfaQuery);

		expect(url).toBe('https://example.com?adid=idfa-1');
	});
});
