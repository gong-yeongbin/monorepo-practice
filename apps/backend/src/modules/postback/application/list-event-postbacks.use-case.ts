// event 포스트백 로그를 조회하는 use-case(어드민 이벤트 모달)
// postback.event_name은 트래커 원본 이벤트명이라, campaign_config로 admin 이벤트명을 트래커 이벤트명으로 변환해 조회한다
import { Inject, Injectable } from '@nestjs/common';
import { PostbackLog } from '@postback/domain/postback.entity';
import { POSTBACK_REPOSITORY, PostbackRepository } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@postback/domain/campaign.repository';
import { EventLogDto } from '@postback/application/dto/postback-log.dto';
import { kstDayRange } from '@common/utils/date.util';

@Injectable()
export class ListEventPostbacksUseCase {
	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository
	) {}

	async execute(dto: EventLogDto): Promise<PostbackLog[]> {
		const campaign = await this.campaignRepository.findByToken(dto.token);
		const trackerEventNames = campaign?.campaign_config
			.filter((campaignConfig) => campaignConfig.admin_event_name === dto.event_name)
			.map((campaignConfig) => campaignConfig.tracker_event_name);

		// 캠페인이 없거나 admin 이벤트명에 매핑된 트래커 이벤트가 없으면 조회할 대상이 없다
		if (!trackerEventNames?.length) return [];

		return this.postbackRepository.findEvents({ token: dto.token, view_code: dto.view_code, ...kstDayRange(dto.start_date, dto.end_date) }, trackerEventNames);
	}
}
