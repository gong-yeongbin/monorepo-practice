import { Test } from '@nestjs/testing';
import { PostbackConsumerUseCase } from './postback-consumer.use-case';
import { POSTBACK_REPOSITORY } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY } from '@postback/domain/campaign.repository';
import { DAILY_REPORT_REPOSITORY } from '@postback/domain/daily-report.repository';

describe('PostbackConsumerUseCase', () => {
	const postbackRepository = { createMany: jest.fn() };
	const campaignRepository = { findByToken: jest.fn() };
	const dailyReportRepository = { upsert: jest.fn() };
	let useCase: PostbackConsumerUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [
				PostbackConsumerUseCase,
				{ provide: POSTBACK_REPOSITORY, useValue: postbackRepository },
				{ provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
				{ provide: DAILY_REPORT_REPOSITORY, useValue: dailyReportRepository },
			],
		}).compile();

		useCase = module.get(PostbackConsumerUseCase);
	});

	it('배치 내 postback을 view_code 기준으로 집계해 저장하고 캠페인 조회는 token당 1회만 수행한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			token: 'token-1',
			campaign_config: [{ tracker_event_name: 'purchase_done', admin_event_name: 'purchase' }],
		});

		const message = JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name: 'purchase_done', revenue: '1000.5' });
		await useCase.execute([message, message]);

		expect(campaignRepository.findByToken).toHaveBeenCalledTimes(1);
		expect(postbackRepository.createMany).toHaveBeenCalledTimes(1);
		expect(postbackRepository.createMany.mock.calls[0][0]).toHaveLength(2);
		expect(dailyReportRepository.upsert).toHaveBeenCalledTimes(1);

		const dailyReport = dailyReportRepository.upsert.mock.calls[0][0];
		expect(dailyReport.purchase).toBe(2);
		expect(dailyReport.revenue).toBe(2000);
	});

	it('깨진 JSON, token 없는 메시지, 캠페인 없는 메시지는 건너뛴다', async () => {
		campaignRepository.findByToken.mockResolvedValue(null);

		await useCase.execute(['not-json', JSON.stringify({ view_code: 'vc-1' }), JSON.stringify({ token: 'no-campaign', view_code: 'vc-1' })]);

		expect(postbackRepository.createMany).not.toHaveBeenCalled();
		expect(dailyReportRepository.upsert).not.toHaveBeenCalled();
	});
});
