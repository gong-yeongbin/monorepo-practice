import { Test } from '@nestjs/testing';
import { ListEventPostbacksUseCase } from './list-event-postbacks.use-case';
import { POSTBACK_REPOSITORY } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY } from '@postback/domain/campaign.repository';

describe('ListEventPostbacksUseCase', () => {
	const postbackRepository = { findEvents: jest.fn() };
	const campaignRepository = { findByToken: jest.fn() };
	let useCase: ListEventPostbacksUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [
				ListEventPostbacksUseCase,
				{ provide: POSTBACK_REPOSITORY, useValue: postbackRepository },
				{ provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
			],
		}).compile();
		useCase = module.get(ListEventPostbacksUseCase);
	});

	const dto = { token: 'tok', event_name: 'purchase', start_date: '2026-07-01', end_date: '2026-07-10' };

	it('admin 이벤트명을 campaign_config로 트래커 이벤트명으로 변환해 조회한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			campaign_config: [
				{ admin_event_name: 'purchase', tracker_event_name: 'af_purchase' },
				{ admin_event_name: 'purchase', tracker_event_name: 'af_subscribe' },
				{ admin_event_name: 'install', tracker_event_name: 'install' },
			],
		});
		const rows = [{ event_name: 'af_purchase' }];
		postbackRepository.findEvents.mockResolvedValue(rows);

		expect(await useCase.execute({ ...dto, view_code: 'vc1' })).toBe(rows);
		expect(postbackRepository.findEvents).toHaveBeenCalledWith(
			{
				token: 'tok',
				view_code: 'vc1',
				start: new Date('2026-06-30T15:00:00.000Z'), // 2026-07-01 00:00 KST
				end: new Date('2026-07-10T15:00:00.000Z'), // 2026-07-11 00:00 KST
			},
			['af_purchase', 'af_subscribe']
		);
	});

	it('캠페인이 없으면 빈 배열을 반환한다', async () => {
		campaignRepository.findByToken.mockResolvedValue(null);

		expect(await useCase.execute(dto)).toEqual([]);
		expect(postbackRepository.findEvents).not.toHaveBeenCalled();
	});

	it('admin 이벤트명에 매핑된 config가 없으면 빈 배열을 반환한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({ campaign_config: [{ admin_event_name: 'install', tracker_event_name: 'install' }] });

		expect(await useCase.execute(dto)).toEqual([]);
		expect(postbackRepository.findEvents).not.toHaveBeenCalled();
	});
});
