// 포스트백 도메인 엔티티 (postback 테이블 저장 레코드)
import { TrackerPostback } from '@trackers/tracker.types';

export class Postback {
	tracker_name: string;
	event_name: string;
	click_id: string;
	pub_id: string | null = null;
	sub_id: string | null = null;
	view_code: string;
	token: string;
	adid: string | null = null;
	idfa: string | null = null;
	ip: string;
	country_code: string;
	clicked_at: Date | string | null = null;
	installed_at: Date | string | null = null;
	evented_at: Date | string | null = null;
	revenue_currency: string | null = null;
	revenue: string | null = null;
	raw_query_params: string;

	static of(props: TrackerPostback & { trackerName: string; eventName: string; pubId: string | null; subId: string | null; rawQueryParams: string }): Postback {
		const postback = new Postback();
		postback.tracker_name = props.trackerName;
		postback.event_name = props.eventName;
		postback.click_id = props.clickId;
		postback.pub_id = props.pubId;
		postback.sub_id = props.subId;
		postback.view_code = props.viewCode;
		postback.token = props.token;
		postback.adid = props.adid;
		postback.idfa = props.idfa;
		postback.ip = props.ip;
		postback.country_code = props.countryCode;
		postback.clicked_at = props.clickedAt ?? null;
		postback.installed_at = props.installedAt ?? null;
		postback.evented_at = props.eventedAt ?? null;
		postback.revenue_currency = props.revenueCurrency ?? null;
		postback.revenue = props.revenue ?? null;
		postback.raw_query_params = props.rawQueryParams;
		return postback;
	}
}
