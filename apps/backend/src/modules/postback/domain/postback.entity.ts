// 포스트백 도메인 타입 (postback 테이블 저장 레코드)과 생성 팩토리
import { TrackerPostback } from '@trackers/tracker.types';

export interface Postback {
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
	country_code: string;
	clicked_at: Date | string | null;
	installed_at: Date | string | null;
	evented_at: Date | string | null;
	revenue_currency: string | null;
	revenue: string | null;
	raw_query_params: string;
}

// 트래커 포스트백(camelCase)을 저장용 postback(snake_case)으로 매핑한다
export const createPostback = (props: TrackerPostback & { trackerName: string; eventName: string; pubId: string | null; subId: string | null; rawQueryParams: string }): Postback => ({
	tracker_name: props.trackerName,
	event_name: props.eventName,
	click_id: props.clickId,
	pub_id: props.pubId,
	sub_id: props.subId,
	view_code: props.viewCode,
	token: props.token,
	adid: props.adid,
	idfa: props.idfa,
	ip: props.ip,
	country_code: props.countryCode,
	clicked_at: props.clickedAt ?? null,
	installed_at: props.installedAt ?? null,
	evented_at: props.eventedAt ?? null,
	revenue_currency: props.revenueCurrency ?? null,
	revenue: props.revenue ?? null,
	raw_query_params: props.rawQueryParams,
});
