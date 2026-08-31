// 포스트백 로그 응답 스키마(Swagger 문서용). 도메인 PostbackLog·UnregisteredCount와 필드를 동일하게 유지한다
import { PostbackLog } from '@postback/domain/postback.entity';
import { UnregisteredCount } from '@postback/domain/postback.repository';
import { AdvertisingPostbackLogs, UnregisteredCampaignCount } from '@postback/application/list-advertising-postbacks.use-case';

export class PostbackLogResponse implements PostbackLog {
	tracker_name: string;

	event_name: string;

	click_id: string;

	pub_id: string | null;

	sub_id: string | null;

	view_code: string;

	token: string;

	adid: string | null;

	idfa: string | null;

	ip: string;

	country_code: string | null;

	clicked_at: Date | string | null;

	installed_at: Date | string | null;

	evented_at: Date | string | null;

	media_sent_at: Date | string | null;

	revenue_currency: string | null;

	revenue: string | null;
}

export class UnregisteredCountResponse implements UnregisteredCount {
	event_name: string;

	count: number;
}

export class UnregisteredCampaignCountResponse extends UnregisteredCountResponse implements UnregisteredCampaignCount {
	token: string;
}

// 광고 단위 일괄 조회 응답. 화면의 모달 3종과 같은 그룹 구성이다
export class AdvertisingPostbackLogsResponse implements AdvertisingPostbackLogs {
	installs: PostbackLogResponse[];

	events: PostbackLogResponse[];

	unregistered: UnregisteredCampaignCountResponse[];
}
