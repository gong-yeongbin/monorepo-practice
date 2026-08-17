import { Inject, Injectable, Logger } from '@nestjs/common';
import { Postback } from '@postback/domain/postback.entity';
import { POSTBACK_REPOSITORY, PostbackRepository } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@postback/domain/campaign.repository';
import { DAILY_REPORT_REPOSITORY, DailyReportRepository } from '@postback/domain/daily-report.repository';
import { Campaign } from '@postback/domain/campaign.entity';
import { CampaignConfig } from '@postback/domain/campaign-config.entity';
import { DailyReport, createDailyReport } from '@postback/domain/daily-report.entity';
import { buildMediaPostbackUrl, MEDIA_POSTBACK_STREAM, MediaPostbackMessage } from '@postback/domain/media-postback';
import { StreamProducer } from '@infra/stream/stream-producer.service';
import { kstBaseDate } from '@common/utils/date.util';

@Injectable()
export class PostbackConsumerUseCase {
	private readonly logger = new Logger(PostbackConsumerUseCase.name);

	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
		@Inject(DAILY_REPORT_REPOSITORY) private readonly dailyReportRepository: DailyReportRepository,
		private readonly producer: StreamProducer
	) {}

	async execute(messages: string[]) {
		const baseDate = kstBaseDate();
		const campaigns = new Map<string, Campaign | null>();
		const dailyReportMap = new Map<string, DailyReport>();
		const mediaMessages: MediaPostbackMessage[] = [];

		for (const message of messages) {
			const postback = this.parse(message);
			if (!postback) continue;

			if (!postback.token) {
				this.logger.warn(`token이 없는 postback을 건너뜁니다: ${message}`);
				continue;
			}

			let campaign = campaigns.get(postback.token);
			if (campaign === undefined) {
				campaign = await this.campaignRepository.findByToken(postback.token);
				campaigns.set(postback.token, campaign);
			}

			if (!campaign) {
				this.logger.warn(`캠페인을 찾을 수 없어 postback을 건너뜁니다: token=${postback.token}`);
				continue;
			}

			const config = campaign.campaign_config.find((campaignConfig) => campaignConfig.tracker_event_name === postback.event_name);

			// 저장 실패 건은 통계 누산·매체 전송도 제외해 postback 로그와의 정합을 지킨다
			let postbackId: number;
			try {
				postbackId = await this.postbackRepository.create(postback);
			} catch (error) {
				this.logger.error(`postback 저장에 실패해 건너뜁니다: token=${postback.token}, ${error}`);
				continue;
			}

			this.accumulate(dailyReportMap, postback, config, baseDate);

			if (config?.send_media) mediaMessages.push({ postback_id: postbackId, url: buildMediaPostbackUrl(campaign.media, config, postback), attempt: 0 });
		}

		// 매체 전송 적재 실패가 통계 저장을 막지 않도록 격리한다(전송 자체는 media-postback 컨슈머가 수행)
		const enqueueResults = await Promise.allSettled(mediaMessages.map((mediaMessage) => this.producer.send(MEDIA_POSTBACK_STREAM, JSON.stringify(mediaMessage))));
		for (const result of enqueueResults) {
			if (result.status === 'rejected') this.logger.error(`매체 포스트백 적재 실패: ${result.reason}`);
		}

		// 개별 upsert 실패가 배치 전체를 무한 재소비시키지 않도록 실패는 로그로 격리한다
		const results = await Promise.allSettled([...dailyReportMap.values()].map((dailyReport) => this.dailyReportRepository.upsert(dailyReport)));
		for (const result of results) {
			if (result.status === 'rejected') this.logger.error(`daily report upsert 실패: ${result.reason}`);
		}
	}

	private parse(value: string): Postback | null {
		try {
			return JSON.parse(value) as Postback;
		} catch {
			this.logger.error(`postback 메시지 파싱에 실패해 건너뜁니다: ${value}`);
			return null;
		}
	}

	private accumulate(dailyReportMap: Map<string, DailyReport>, postback: Postback, config: CampaignConfig | undefined, baseDate: Date) {
		let dailyReportDto = dailyReportMap.get(postback.view_code);
		if (!dailyReportDto) {
			dailyReportDto = createDailyReport({ view_code: postback.view_code, token: postback.token, pub_id: postback.pub_id, sub_id: postback.sub_id, created_date: baseDate });
			dailyReportMap.set(postback.view_code, dailyReportDto);
		}

		switch (config?.admin_event_name) {
			case 'install':
				dailyReportDto.install += 1;
				break;
			case 'registration':
				dailyReportDto.registration += 1;
				break;
			case 'retention':
				dailyReportDto.retention += 1;
				break;
			case 'purchase':
				dailyReportDto.purchase += 1;
				dailyReportDto.revenue += this.toRevenue(postback.revenue);
				break;
			case 'etc1':
				dailyReportDto.etc1 += 1;
				break;
			case 'etc2':
				dailyReportDto.etc2 += 1;
				break;
			case 'etc3':
				dailyReportDto.etc3 += 1;
				break;
			case 'etc4':
				dailyReportDto.etc4 += 1;
				break;
			case 'etc5':
				dailyReportDto.etc5 += 1;
				break;
			default:
				dailyReportDto.unregistered += 1;
				break;
		}
	}

	// daily_report.revenue가 Int 컬럼이므로 소수점은 버리고, 숫자가 아니면 0으로 처리한다
	private toRevenue(revenue: string | null): number {
		const value = Number(revenue);
		return Number.isFinite(value) ? Math.trunc(value) : 0;
	}
}
