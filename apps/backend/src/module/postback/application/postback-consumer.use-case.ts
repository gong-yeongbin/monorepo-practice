import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PostbackDto } from '@postback/application/dto/postback.dto';
import { POSTBACK_REPOSITORY, PostbackRepository } from '@postback/application/port/postback.repository';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@campaign/domain/campaign.repository';
import { DAILY_STATISTIC_REPOSITORY, DailyStatisticRepository } from '@campaign/domain/daily-statistic.repository';
import { Campaign } from '@campaign/domain/campaign.entity';
import { DailyStatistic } from '@campaign/domain/daily-statistic.entity';
import { CONSUMER_PORT, ConsumerPort } from '@core/kafka/consumer.port';
import { kstBaseDate } from '@src/common/util/date.util';

@Injectable()
export class PostbackConsumerUseCase implements OnModuleInit {
	private readonly logger = new Logger(PostbackConsumerUseCase.name);

	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: DailyStatisticRepository,
		@Inject(CONSUMER_PORT) private readonly consumer: ConsumerPort
	) {}

	onModuleInit() {
		this.consumer.register('postback', (messages) => this.consume(messages));
	}

	private async consume(messages: string[]) {
		const baseDate = kstBaseDate();
		const campaigns = new Map<string, Campaign | null>();
		const postbacks: PostbackDto[] = [];
		const dailyStatisticMap = new Map<string, DailyStatistic>();

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
			this.accumulate(dailyStatisticMap, postback, campaign, baseDate);
		}

		if (postbacks.length) await this.postbackRepository.createMany(postbacks);

		// 개별 upsert 실패가 배치 전체를 무한 재소비시키지 않도록 실패는 로그로 격리한다
		const results = await Promise.allSettled([...dailyStatisticMap.values()].map((dailyStatistic) => this.dailyStatisticRepository.upsert(dailyStatistic)));
		for (const result of results) {
			if (result.status === 'rejected') this.logger.error(`daily statistic upsert 실패: ${result.reason}`);
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

	private accumulate(dailyStatisticMap: Map<string, DailyStatistic>, postback: PostbackDto, campaign: Campaign, baseDate: Date) {
		let dailyStatisticDto = dailyStatisticMap.get(postback.view_code);
		if (!dailyStatisticDto) {
			dailyStatisticDto = new DailyStatistic({ view_code: postback.view_code, token: postback.token, pub_id: postback.pub_id, sub_id: postback.sub_id, created_date: baseDate });
			dailyStatisticMap.set(postback.view_code, dailyStatisticDto);
		}

		const event = campaign.campaign_config.find((campaignConfig) => campaignConfig.tracker_event_name === postback.event_name);
		switch (event?.admin_event_name) {
			case 'install':
				dailyStatisticDto.install += 1;
				break;
			case 'registration':
				dailyStatisticDto.registration += 1;
				break;
			case 'retention':
				dailyStatisticDto.retention += 1;
				break;
			case 'purchase':
				dailyStatisticDto.purchase += 1;
				dailyStatisticDto.revenue += this.toRevenue(postback.revenue);
				break;
			case 'etc1':
				dailyStatisticDto.etc1 += 1;
				break;
			case 'etc2':
				dailyStatisticDto.etc2 += 1;
				break;
			case 'etc3':
				dailyStatisticDto.etc3 += 1;
				break;
			case 'etc4':
				dailyStatisticDto.etc4 += 1;
				break;
			case 'etc5':
				dailyStatisticDto.etc5 += 1;
				break;
			default:
				dailyStatisticDto.unregistered += 1;
				break;
		}
	}

	// daily_statistic.revenue가 Int 컬럼이므로 소수점은 버리고, 숫자가 아니면 0으로 처리한다
	private toRevenue(revenue: string | null): number {
		const value = Number(revenue);
		return Number.isFinite(value) ? Math.trunc(value) : 0;
	}
}
