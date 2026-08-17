// 매체 포스트백 재전송 도메인: 스트림 메시지 타입과 URL 조립 순수 함수
import { Media } from '@postback/domain/campaign.entity';
import { CampaignConfig } from '@postback/domain/campaign-config.entity';
import { Postback } from '@postback/domain/postback.entity';

export const MEDIA_POSTBACK_STREAM = 'media-postback';
export const MEDIA_POSTBACK_MAX_ATTEMPTS = 3; // 초회 포함 총 전송 시도 횟수

// media-postback 스트림에 적재되는 메시지. postback_id로 전송 성공 시 media_sent_at을 갱신한다.
export interface MediaPostbackMessage {
	postback_id: number;
	url: string;
	attempt: number;
}

// 매체 URL 템플릿의 {snake_case} 플레이스홀더를 postback 값으로 치환한다.
// 값은 쿼리스트링에 들어가므로 인코딩한다(트래킹 URL 치환과 달리 매체 템플릿엔 인코딩된 값이 안전).
export const buildMediaPostbackUrl = (media: Media, config: CampaignConfig, postback: Postback): string => {
	const template = config.admin_event_name === 'install' ? media.install_postback_url : media.event_postback_url;
	const params: Record<string, string | null | undefined> = {
		click_id: postback.click_id,
		event: config.media_event_name,
		adid: postback.adid,
		idfa: postback.idfa,
		token: postback.token,
		pub_id: postback.pub_id,
		sub_id: postback.sub_id,
		view_code: postback.view_code,
		revenue: postback.revenue,
		currency: postback.revenue_currency,
	};
	return template.replace(/\{(\w+)\}/g, (_, key: string) => encodeURIComponent(params[key] ?? ''));
};
