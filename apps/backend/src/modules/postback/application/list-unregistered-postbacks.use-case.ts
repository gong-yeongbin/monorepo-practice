// 미등록 이벤트 카운트를 조회하는 use-case(어드민 미등록 모달)
// consumer와 동일 규칙: campaign_config의 tracker_event_name에 없는 event_name이 미등록이다
import { Inject, Injectable } from '@nestjs/common';
import { POSTBACK_REPOSITORY, PostbackRepository, UnregisteredCount } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@postback/domain/campaign.repository';
import { UnregisteredLogDto } from '@postback/application/dto/postback-log.dto';
import { kstDayRange } from '@common/utils/date.util';

@Injectable()
export class ListUnregisteredPostbacksUseCase {
	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository
	) {}

	async execute(dto: UnregisteredLogDto): Promise<UnregisteredCount[]> {
		const campaign = await this.campaignRepository.findByToken(dto.token);
		if (!campaign) return [];

		const registeredEventNames = campaign.campaign_config.map((campaignConfig) => campaignConfig.tracker_event_name);
		const { start, end } = kstDayRange(dto.start_date, dto.end_date);

		return this.postbackRepository.countUnregistered(dto.token, registeredEventNames, start, end);
	}
}
