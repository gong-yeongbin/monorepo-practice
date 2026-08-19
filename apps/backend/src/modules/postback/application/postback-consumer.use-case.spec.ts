import { Test } from '@nestjs/testing';
import { PostbackConsumerUseCase } from './postback-consumer.use-case';
import { POSTBACK_REPOSITORY } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY } from '@postback/domain/campaign.repository';
import { DAILY_REPORT_REPOSITORY } from '@postback/domain/daily-report.repository';
import { StreamProducer } from '@infra/stream/stream-producer.service';

describe('PostbackConsumerUseCase', () => {
	const postbackRepository = { create: jest.fn() };
	const campaignRepository = { findByToken: jest.fn() };
	const dailyReportRepository = { upsertMany: jest.fn() };
	const producer = { send: jest.fn() };
	let useCase: PostbackConsumerUseCase;

	const media = { install_postback_url: 'https://media.example.com/install?click_id={click_id}', event_postback_url: 'https://media.example.com/event?click_id={click_id}&event={event}' };

	beforeEach(async () => {
		jest.clearAllMocks();
		postbackRepository.create.mockResolvedValue(1);

		const module = await Test.createTestingModule({
			providers: [
				PostbackConsumerUseCase,
				{ provide: POSTBACK_REPOSITORY, useValue: postbackRepository },
				{ provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
				{ provide: DAILY_REPORT_REPOSITORY, useValue: dailyReportRepository },
				{ provide: StreamProducer, useValue: producer },
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
		expect(postbackRepository.create).toHaveBeenCalledTimes(2);
		expect(dailyReportRepository.upsertMany).toHaveBeenCalledTimes(1);
		expect(dailyReportRepository.upsertMany.mock.calls[0][0]).toHaveLength(1);

		const dailyReport = dailyReportRepository.upsertMany.mock.calls[0][0][0];
		expect(dailyReport.purchase).toBe(2);
		expect(dailyReport.revenue).toBe(2000);
	});

	it('깨진 JSON, token 없는 메시지, 캠페인 없는 메시지는 건너뛴다', async () => {
		campaignRepository.findByToken.mockResolvedValue(null);

		await useCase.execute(['not-json', JSON.stringify({ view_code: 'vc-1' }), JSON.stringify({ token: 'no-campaign', view_code: 'vc-1' })]);

		expect(postbackRepository.create).not.toHaveBeenCalled();
		expect(dailyReportRepository.upsertMany).toHaveBeenCalledWith([]);
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

		const report = dailyReportRepository.upsertMany.mock.calls[0][0][0];
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

		const report = dailyReportRepository.upsertMany.mock.calls[0][0][0];
		expect(report.purchase).toBe(1);
		expect(report.revenue).toBe(0);
	});

	it('daily report 배치 upsert가 실패해도 예외를 전파하지 않는다 (postback 로그 중복 방지)', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			token: 'token-1',
			campaign_config: [{ tracker_event_name: 'purchase_done', admin_event_name: 'purchase' }],
		});
		dailyReportRepository.upsertMany.mockRejectedValue(new Error('db down'));

		await expect(useCase.execute([JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name: 'purchase_done', revenue: '10' })])).resolves.toBeUndefined();
	});

	it('send_media 설정이 켜진 이벤트는 치환된 URL과 저장 id로 media-postback 스트림에 적재한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			token: 'token-1',
			media,
			campaign_config: [{ tracker_event_name: 'ev_install', admin_event_name: 'install', media_event_name: 'm_install', send_media: true }],
		});
		postbackRepository.create.mockResolvedValue(77);

		await useCase.execute([JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name: 'ev_install', click_id: 'c-1' })]);

		expect(producer.send).toHaveBeenCalledWith('media-postback', JSON.stringify({ postback_id: 77, url: 'https://media.example.com/install?click_id=c-1', attempt: 0 }));
	});

	it('send_media가 꺼졌거나 config 미매칭(unregistered)이면 적재하지 않는다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			token: 'token-1',
			media,
			campaign_config: [{ tracker_event_name: 'ev_install', admin_event_name: 'install', media_event_name: 'm_install', send_media: false }],
		});

		await useCase.execute([
			JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name: 'ev_install' }),
			JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name: 'unknown_event' }),
		]);

		expect(postbackRepository.create).toHaveBeenCalledTimes(2);
		expect(producer.send).not.toHaveBeenCalled();
	});

	it('postback 저장이 실패한 건은 누산·매체 적재도 건너뛰고 나머지는 정상 처리한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			token: 'token-1',
			media,
			campaign_config: [{ tracker_event_name: 'ev_install', admin_event_name: 'install', media_event_name: 'm_install', send_media: true }],
		});
		postbackRepository.create.mockRejectedValueOnce(new Error('db down')).mockResolvedValueOnce(2);

		const message = JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name: 'ev_install', click_id: 'c-1' });
		await useCase.execute([message, message]);

		const report = dailyReportRepository.upsertMany.mock.calls[0][0][0];
		expect(report.install).toBe(1);
		expect(producer.send).toHaveBeenCalledTimes(1);
		expect(producer.send).toHaveBeenCalledWith('media-postback', expect.stringContaining('"postback_id":2'));
	});

	it('media-postback 적재가 실패해도 예외를 전파하지 않고 통계는 저장된다', async () => {
		campaignRepository.findByToken.mockResolvedValue({
			token: 'token-1',
			media,
			campaign_config: [{ tracker_event_name: 'ev_install', admin_event_name: 'install', media_event_name: 'm_install', send_media: true }],
		});
		producer.send.mockRejectedValue(new Error('redis down'));

		await expect(useCase.execute([JSON.stringify({ token: 'token-1', view_code: 'vc-1', event_name: 'ev_install' })])).resolves.toBeUndefined();
		expect(dailyReportRepository.upsertMany).toHaveBeenCalledTimes(1);
	});
});
