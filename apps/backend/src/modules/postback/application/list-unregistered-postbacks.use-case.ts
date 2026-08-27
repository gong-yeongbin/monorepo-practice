// 미등록 이벤트 카운트를 조회하는 use-case(어드민 미등록 모달)
// consumer와 동일 규칙: campaign_config의 tracker_event_name에 없는 event_name이 미등록이다
import { Inject, Injectable } from '@nestjs/common';
import { POSTBACK_REPOSITORY, PostbackRepository, UnregisteredCount } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@postback/domain/campaign.repository';
import { UnregisteredLogDto } from '@postback/application/dto/postback-log.dto';
import { kstDayRange } from '@common/utils/date.util';
import { AdvertisingScope, isAdvertisingAllowed } from '@auth/application/advertising-scope';

@Injectable()
export class ListUnregisteredPostbacksUseCase {
	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository
	) {}

	async execute(dto: UnregisteredLogDto, scope: AdvertisingScope): Promise<UnregisteredCount[]> {
		const campaign = await this.campaignRepository.findByToken(dto.token);
		// 캠페인이 없거나 허용 광고 밖이면 조회할 대상이 없다
		if (!campaign || !isAdvertisingAllowed(scope, campaign.advertising_id)) return [];

		const registeredEventNames = campaign.campaign_config.map((campaignConfig) => campaignConfig.tracker_event_name);
		const { start, end } = kstDayRange(dto.start_date, dto.end_date);

		return this.postbackRepository.countUnregistered(dto.token, registeredEventNames, start, end);
	}
}
