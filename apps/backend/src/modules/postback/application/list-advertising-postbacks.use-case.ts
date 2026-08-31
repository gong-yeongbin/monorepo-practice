// 광고에 속한 모든 캠페인의 포스트백을 한 번에 모으는 use-case(어드민 엑셀 다운로드)
// 화면의 모달 3종과 같은 구성으로 install·event·미등록을 그룹지어 돌려준다
import { Inject, Injectable } from '@nestjs/common';
import { PostbackLog } from '@postback/domain/postback.entity';
import { POSTBACK_REPOSITORY, PostbackRepository, UnregisteredCount } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@postback/domain/campaign.repository';
import { AdvertisingLogDto } from '@postback/application/dto/postback-log.dto';
import { kstDayRange } from '@common/utils/date.util';
import { AdvertisingScope, isAdvertisingAllowed } from '@auth/application/advertising-scope';

// 미등록 카운트는 여러 캠페인이 섞이므로 어느 캠페인 것인지 token을 붙인다
export interface UnregisteredCampaignCount extends UnregisteredCount {
	token: string;
}

export interface AdvertisingPostbackLogs {
	installs: PostbackLog[];
	events: PostbackLog[];
	unregistered: UnregisteredCampaignCount[];
}

const EMPTY: AdvertisingPostbackLogs = { installs: [], events: [], unregistered: [] };

@Injectable()
export class ListAdvertisingPostbacksUseCase {
	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository
	) {}

	async execute(dto: AdvertisingLogDto, scope: AdvertisingScope): Promise<AdvertisingPostbackLogs> {
		// 허용 광고 밖이면 조회할 대상이 없다(403을 쓰지 않는다 — 프론트가 세션 만료로 오인한다)
		if (!isAdvertisingAllowed(scope, dto.advertising_id)) return EMPTY;

		const campaigns = await this.campaignRepository.findByAdvertisingId(dto.advertising_id);
		const { start, end } = kstDayRange(dto.start_date, dto.end_date);

		const perCampaign = await Promise.all(
			campaigns.map(async (campaign) => {
				// event 조회는 트래커 원본 이벤트명 기준이라 campaign_config에 등록된 것 전부를 넘긴다.
				// 비어 있어도 Prisma의 in: []은 항상 거짓이라 별도 분기가 필요 없다.
				const trackerEventNames = campaign.campaign_config.map((campaignConfig) => campaignConfig.tracker_event_name);
				const filter = { token: campaign.token, start, end };

				const [installs, events, unregistered] = await Promise.all([
					this.postbackRepository.findInstalls(filter),
					this.postbackRepository.findEvents(filter, trackerEventNames),
					this.postbackRepository.countUnregistered(campaign.token, trackerEventNames, start, end),
				]);

				return { installs, events, unregistered: unregistered.map((count) => ({ token: campaign.token, ...count })) };
			})
		);

		return {
			installs: perCampaign.flatMap((result) => result.installs),
			events: perCampaign.flatMap((result) => result.events),
			unregistered: perCampaign.flatMap((result) => result.unregistered),
		};
	}
}
