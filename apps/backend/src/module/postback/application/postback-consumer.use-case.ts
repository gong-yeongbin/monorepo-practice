import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PostbackDto } from '@postback/application/dto/postback.dto';
import { POSTBACK_REPOSITORY, PostbackRepository } from '@postback/application/port/postback.repository';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@postback/domain/campaign.repository';
import { DAILY_REPORT_REPOSITORY, DailyReportRepository } from '@postback/domain/daily-report.repository';
import { Campaign } from '@postback/domain/campaign.entity';
import { DailyReport } from '@postback/domain/daily-report.entity';
import { CONSUMER_PORT, ConsumerPort } from '@core/kafka/consumer.port';
import { kstBaseDate } from '@src/common/util/date.util';

@Injectable()
export class PostbackConsumerUseCase implements OnModuleInit {
	private readonly logger = new Logger(PostbackConsumerUseCase.name);

	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
		@Inject(DAILY_REPORT_REPOSITORY) private readonly dailyReportRepository: DailyReportRepository,
		@Inject(CONSUMER_PORT) private readonly consumer: ConsumerPort
	) {}

	onModuleInit() {
		this.consumer.register('postback', (messages) => this.consume(messages));
	}

	private async consume(messages: string[]) {
		const baseDate = kstBaseDate();
		const campaigns = new Map<string, Campaign | null>();
		const postbacks: PostbackDto[] = [];
		const dailyReportMap = new Map<string, DailyReport>();

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

			postbacks.push(postback);
			this.accumulate(dailyReportMap, postback, campaign, baseDate);
		}

		if (postbacks.length) await this.postbackRepository.createMany(postbacks);

		// 개별 upsert 실패가 배치 전체를 무한 재소비시키지 않도록 실패는 로그로 격리한다
		const results = await Promise.allSettled([...dailyReportMap.values()].map((dailyReport) => this.dailyReportRepository.upsert(dailyReport)));
		for (const result of results) {
			if (result.status === 'rejected') this.logger.error(`daily report upsert 실패: ${result.reason}`);
		}
	}

	private parse(value: string): PostbackDto | null {
		try {
			return Object.assign(new PostbackDto(), JSON.parse(value) as Partial<PostbackDto>);
		} catch {
			this.logger.error(`postback 메시지 파싱에 실패해 건너뜁니다: ${value}`);
			return null;
		}
	}

	private accumulate(dailyReportMap: Map<string, DailyReport>, postback: PostbackDto, campaign: Campaign, baseDate: Date) {
		let dailyReportDto = dailyReportMap.get(postback.view_code);
		if (!dailyReportDto) {
			dailyReportDto = new DailyReport({ view_code: postback.view_code, token: postback.token, pub_id: postback.pub_id, sub_id: postback.sub_id, created_date: baseDate });
			dailyReportMap.set(postback.view_code, dailyReportDto);
		}

		const event = campaign.campaign_config.find((campaignConfig) => campaignConfig.tracker_event_name === postback.event_name);
		switch (event?.admin_event_name) {
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
