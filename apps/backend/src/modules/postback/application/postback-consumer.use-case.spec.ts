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

	it('admin_event_name별로 해당 카운터를 누산하고 매핑 없는 이벤트는 unregistered로 집계한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			token: 'token-1',
			campaign_config: [
				{ tracker_event_name: 'ev_install', admin_event_name: 'install' },
				{ tracker_event_name: 'ev_reg', admin_event_name: 'registration' },
				{ tracker_event_name: 'ev_ret', admin_event_name: 'retention' },
				{ tracker_event_name: 'ev_etc1', admin_event_name: 'etc1' },
				{ tracker_event_name: 'ev_etc2', admin_event_name: 'etc2' },
				{ tracker_event_name: 'ev_etc3', admin_event_name: 'etc3' },
				{ tracker_event_name: 'ev_etc4', admin_event_name: 'etc4' },
				{ tracker_event_name: 'ev_etc5', admin_event_name: 'etc5' },
			],
		});

		const msg = (event_name: string) => JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name });
		await useCase.execute([msg('ev_install'), msg('ev_reg'), msg('ev_ret'), msg('ev_etc1'), msg('ev_etc2'), msg('ev_etc3'), msg('ev_etc4'), msg('ev_etc5'), msg('unknown_event')]);

		const report = dailyReportRepository.upsert.mock.calls[0][0];
		expect(report.install).toBe(1);
		expect(report.registration).toBe(1);
		expect(report.retention).toBe(1);
		expect(report.etc1).toBe(1);
		expect(report.etc2).toBe(1);
		expect(report.etc3).toBe(1);
		expect(report.etc4).toBe(1);
		expect(report.etc5).toBe(1);
		expect(report.unregistered).toBe(1);
	});

	it('숫자가 아닌 revenue는 0으로 처리한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			token: 'token-1',
			campaign_config: [{ tracker_event_name: 'purchase_done', admin_event_name: 'purchase' }],
		});

		await useCase.execute([JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name: 'purchase_done', revenue: 'not-a-number' })]);

		const report = dailyReportRepository.upsert.mock.calls[0][0];
		expect(report.purchase).toBe(1);
		expect(report.revenue).toBe(0);
	});

	it('daily report upsert가 실패해도 예외를 전파하지 않는다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			token: 'token-1',
			campaign_config: [{ tracker_event_name: 'purchase_done', admin_event_name: 'purchase' }],
		});
		dailyReportRepository.upsert.mockRejectedValue(new Error('db down'));

		await expect(useCase.execute([JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name: 'purchase_done', revenue: '10' })])).resolves.toBeUndefined();
	});
});
