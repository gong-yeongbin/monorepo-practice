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
	device_model: string | null;
	device_manufacturer: string | null;
	device_type: string | null;
	os: string | null;
	os_version: string | null;
	carrier: string | null;
	language: string | null;
	app_version: string | null;
	clicked_at: Date | string | null;
	installed_at: Date | string | null;
	evented_at: Date | string | null;
	revenue_currency: string | null;
	revenue: string | null;
	media_sent_at: Date | string | null;
	raw_query_params: string;
}

// 어드민 로그 조회용 레코드. raw_query_params는 무겁고 화면에서 안 쓰므로 제외한다.
// language·app_version은 수집만 하고 아직 화면에서 쓰지 않아 조회 select에서 빠져 있다.
// country_code는 스키마상 nullable이라 저장 타입과 달리 null 허용으로 재정의한다.
export interface PostbackLog extends Omit<Postback, 'raw_query_params' | 'country_code' | 'language' | 'app_version'> {
	country_code: string | null;
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
	device_model: props.deviceModel ?? null,
	device_manufacturer: props.deviceManufacturer ?? null,
	device_type: props.deviceType ?? null,
	os: props.os ?? null,
	os_version: props.osVersion ?? null,
	carrier: props.carrier ?? null,
	language: props.language ?? null,
	app_version: props.appVersion ?? null,
	clicked_at: props.clickedAt ?? null,
	installed_at: props.installedAt ?? null,
	evented_at: props.eventedAt ?? null,
	revenue_currency: props.revenueCurrency ?? null,
	revenue: props.revenue ?? null,
	media_sent_at: null, // 수신 시점엔 항상 미전송. 매체 전송 성공 시 컨슈머가 채운다
	raw_query_params: props.rawQueryParams,
});
