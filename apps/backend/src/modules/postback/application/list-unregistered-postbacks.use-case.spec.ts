import { Test } from '@nestjs/testing';
import { ListUnregisteredPostbacksUseCase } from './list-unregistered-postbacks.use-case';
import { POSTBACK_REPOSITORY } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY } from '@postback/domain/campaign.repository';

describe('ListUnregisteredPostbacksUseCase', () => {
	const postbackRepository = { countUnregistered: jest.fn() };
	const campaignRepository = { findByToken: jest.fn() };
	let useCase: ListUnregisteredPostbacksUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [
				ListUnregisteredPostbacksUseCase,
				{ provide: POSTBACK_REPOSITORY, useValue: postbackRepository },
				{ provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
			],
		}).compile();
		useCase = module.get(ListUnregisteredPostbacksUseCase);
	});

	const dto = { token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' };

	it('campaign_config의 트래커 이벤트명을 등록 목록으로 넘겨 카운트를 조회한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			advertising_id: 1,
			campaign_config: [
				{ admin_event_name: 'install', tracker_event_name: 'install' },
				{ admin_event_name: 'purchase', tracker_event_name: 'af_purchase' },
			],
		});
		const counts = [{ event_name: 'af_custom', count: 3 }];
		postbackRepository.countUnregistered.mockResolvedValue(counts);

		expect(await useCase.execute(dto, [1])).toBe(counts);
		expect(postbackRepository.countUnregistered).toHaveBeenCalledWith(
			'tok',
			['install', 'af_purchase'],
			new Date('2026-06-30T15:00:00.000Z'), // 2026-07-01 00:00 KST
			new Date('2026-07-10T15:00:00.000Z') // 2026-07-11 00:00 KST
		);
	});

	it('캠페인이 없으면 빈 배열을 반환한다', async () => {
		campaignRepository.findByToken.mockResolvedValue(null);

		expect(await useCase.execute(dto, undefined)).toEqual([]);
		expect(postbackRepository.countUnregistered).not.toHaveBeenCalled();
	});

	it('캠페인이 허용 광고 밖이면 빈 배열을 반환한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({ advertising_id: 2, campaign_config: [] });

		expect(await useCase.execute(dto, [1])).toEqual([]);
		expect(postbackRepository.countUnregistered).not.toHaveBeenCalled();
	});
});
