// install 포스트백 로그를 조회하는 use-case(어드민 인스톨 모달)
import { Inject, Injectable } from '@nestjs/common';
import { PostbackLog } from '@postback/domain/postback.entity';
import { POSTBACK_REPOSITORY, PostbackRepository } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '@postback/domain/campaign.repository';
import { InstallLogDto } from '@postback/application/dto/postback-log.dto';
import { kstDayRange } from '@common/utils/date.util';
import { viewCodeCodec } from '@common/utils/view-code.util';
import { AdvertisingScope, isAdvertisingAllowed } from '@auth/application/advertising-scope';

@Injectable()
export class ListInstallPostbacksUseCase {
	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository
	) {}

	async execute(dto: InstallLogDto, scope: AdvertisingScope): Promise<PostbackLog[]> {
		// DEVELOPER·ADMIN은 스코핑 면제라 campaign 조회 왕복 자체를 건너뛴다
		if (scope !== undefined && !(await this.isAllowed(dto, scope))) return [];

		return this.postbackRepository.findInstalls({ token: dto.token, view_code: dto.view_code, ...kstDayRange(dto.start_date, dto.end_date) });
	}

	// 조회 대상 캠페인이 허용 광고에 속하는지 확인한다.
	private async isAllowed(dto: InstallLogDto, scope: number[]): Promise<boolean> {
		// DTO상 token·view_code 중 하나는 반드시 온다(@ValidateIf). token이 없으면 view_code에서 복원한다.
		// view_code 평문은 `token:pubId:subId`(tracking.use-case의 encode 규칙)이고, decode는 실패해도 던지지 않고
		// 입력을 그대로 돌려주므로 잘못된 view_code는 존재하지 않는 token → campaign 없음 → 빈 결과로 흘러간다.
		const [decodedToken = ''] = viewCodeCodec.decode(dto.view_code ?? '').split(':');
		const campaign = await this.campaignRepository.findByToken(dto.token ?? decodedToken);

		return campaign !== null && isAdvertisingAllowed(scope, campaign.advertising_id);
	}
}
