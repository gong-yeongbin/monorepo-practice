import { Test } from '@nestjs/testing';
import { ListAdvertisingPostbacksUseCase } from './list-advertising-postbacks.use-case';
import { POSTBACK_REPOSITORY } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY } from '@postback/domain/campaign.repository';

describe('ListAdvertisingPostbacksUseCase', () => {
	const postbackRepository = { findInstalls: jest.fn(), findEvents: jest.fn(), countUnregistered: jest.fn() };
	const campaignRepository = { findByAdvertisingId: jest.fn() };
	let useCase: ListAdvertisingPostbacksUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [
				ListAdvertisingPostbacksUseCase,
				{ provide: POSTBACK_REPOSITORY, useValue: postbackRepository },
				{ provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
			],
		}).compile();
		useCase = module.get(ListAdvertisingPostbacksUseCase);
	});

	const dto = { advertising_id: 1, start_date: '2026-07-01', end_date: '2026-07-10' };
	const start = new Date('2026-06-30T15:00:00.000Z'); // 2026-07-01 00:00 KST
	const end = new Date('2026-07-10T15:00:00.000Z'); // 2026-07-11 00:00 KST

	it('광고의 모든 캠페인을 훑어 install·event·미등록을 합쳐 반환한다', async () => {
		campaignRepository.findByAdvertisingId.mockResolvedValue([
			{ token: 'tok-a', campaign_config: [{ tracker_event_name: 'af_purchase' }] },
			{ token: 'tok-b', campaign_config: [] },
		]);
		postbackRepository.findInstalls.mockResolvedValueOnce([{ token: 'tok-a' }]).mockResolvedValueOnce([{ token: 'tok-b' }]);
		postbackRepository.findEvents.mockResolvedValueOnce([{ token: 'tok-a', event_name: 'af_purchase' }]).mockResolvedValueOnce([]);
		postbackRepository.countUnregistered.mockResolvedValueOnce([{ event_name: 'af_custom', count: 3 }]).mockResolvedValueOnce([]);

		expect(await useCase.execute(dto, [1])).toEqual({
			installs: [{ token: 'tok-a' }, { token: 'tok-b' }],
			events: [{ token: 'tok-a', event_name: 'af_purchase' }],
			unregistered: [{ token: 'tok-a', event_name: 'af_custom', count: 3 }],
		});
		expect(postbackRepository.findInstalls).toHaveBeenCalledWith({ token: 'tok-a', start, end });
		expect(postbackRepository.findEvents).toHaveBeenCalledWith({ token: 'tok-a', start, end }, ['af_purchase']);
		expect(postbackRepository.countUnregistered).toHaveBeenCalledWith('tok-a', ['af_purchase'], start, end);
	});

	it('캠페인이 없으면 빈 그룹을 반환한다', async () => {
		campaignRepository.findByAdvertisingId.mockResolvedValue([]);

		expect(await useCase.execute(dto, undefined)).toEqual({ installs: [], events: [], unregistered: [] });
		expect(postbackRepository.findInstalls).not.toHaveBeenCalled();
	});

	it('허용 광고 밖이면 조회 없이 빈 그룹을 반환한다', async () => {
		expect(await useCase.execute(dto, [2])).toEqual({ installs: [], events: [], unregistered: [] });
		expect(campaignRepository.findByAdvertisingId).not.toHaveBeenCalled();
	});
});
