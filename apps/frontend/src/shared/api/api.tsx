import React from 'react';
import { axiosInstance } from '@/shared/api/axios';

export const getDataWithCvr = (data: any) => {
	data.forEach((row: { cvr: number; install: string; click: string }) => {
		const cvrValue = (parseInt(row.install, 10) / parseInt(row.click, 10)) * 100;
		const roundedCvr = roundCvr(cvrValue);
		row.cvr = ensureFiniteNumber(roundedCvr);
	});
	return [...data];
};

const ensureFiniteNumber = (cvr: any) => {
	if (Number.isNaN(cvr) || !Number.isFinite(cvr)) {
		return 0;
	}
	return cvr;
};

const roundCvr = (data: number) => {
	const scaled = Number((Math.abs(data) * 100).toPrecision(15));
	return (Math.round(scaled) / 100) * Math.sign(data);
};

// --- backend 응답(snake_case·숫자 타입) → 레거시 화면 형태(camelCase·문자열) 매퍼 ---
// 테이블·합계 유틸(getTotal의 includes(','), getCell.normal의 replace 등)이 문자열 카운터를
// 가정하므로 숫자 카운터는 전부 문자열로 변환한다.

interface BackendCounters {
	click: number;
	install: number;
	registration: number;
	retention: number;
	purchase: number;
	revenue: number;
	etc1: number;
	etc2: number;
	etc3: number;
	etc4: number;
	etc5: number;
}

export const toCounterStrings = (row: BackendCounters) => ({
	click: String(row.click),
	install: String(row.install),
	registration: String(row.registration),
	retention: String(row.retention),
	purchase: String(row.purchase),
	revenue: String(row.revenue),
	etc1: String(row.etc1),
	etc2: String(row.etc2),
	etc3: String(row.etc3),
	etc4: String(row.etc4),
	etc5: String(row.etc5),
});

// backend에는 platform 필드가 없어 광고명 접미사 (AOS)/(iOS)에서 파생한다
export const platformFromName = (name: string) => {
	if (name.includes('(iOS)')) {
		return 'iOS';
	}
	if (name.includes('(AOS)')) {
		return 'AOS';
	}
	return '';
};

export const mapDashboardRow = (row: BackendCounters & { advertising_id: number; advertising_name: string }) => ({
	idx: String(row.advertising_id),
	name: row.advertising_name,
	platform: platformFromName(row.advertising_name),
	...toCounterStrings(row),
});

export const mapDetailRow = (
	row: BackendCounters & {
		campaign_id: number;
		campaign_name: string;
		type: string;
		is_active: boolean;
		media_id: number;
		media_name: string;
		token: string;
		unregistered: number;
	},
) => ({
	campaignIdx: String(row.campaign_id),
	campaignName: row.campaign_name,
	type: row.type,
	status: row.is_active ? 1 : 0,
	createdAt: '', // backend detail 응답에 생성일이 없다
	mediaIdx: String(row.media_id),
	mediaName: row.media_name,
	token: row.token,
	unregistered: String(row.unregistered),
	...toCounterStrings(row),
});

export const mapDailyRow = (row: BackendCounters & { created_date: string; unregistered: number }) => ({
	createdAt: row.created_date,
	unregistered: String(row.unregistered),
	...toCounterStrings(row),
});

export const mapAdvertisingListItem = (row: {
	id: number;
	name: string;
	image: string | null;
	status: boolean;
	campaign: number;
}) => ({
	idx: String(row.id),
	name: row.name,
	platform: platformFromName(row.name),
	imageUrl: row.image,
	status: row.status ? 1 : 0,
	campaign: row.campaign,
	createdAt: '',
	updatedAt: '',
});

export const mapCampaignListItem = (row: {
	campaign_id: number;
	token: string;
	campaign_name: string;
	type: string;
	is_active: boolean;
	media_name: string;
}) => ({
	campaignIdx: String(row.campaign_id),
	token: row.token,
	campaignName: row.campaign_name,
	campaignType: row.type,
	campaignStatus: row.is_active ? 1 : 0,
	campaignBlock: 0, // backend에 block 필드가 없다 (미구현 보고 대상)
	mediaName: row.media_name,
	trackerName: '',
});

export const mapConfigRow = (row: {
	tracker_event_name: string;
	admin_event_name: string;
	media_event_name: string;
	send_media: boolean;
}) => ({
	tracker: row.tracker_event_name,
	admin: row.admin_event_name,
	media: row.media_event_name,
	status: row.send_media ? 1 : 0,
});

// 이벤트 편집 화면의 행을 PATCH /config/:campaignId 배열 body로 역변환한다.
// backend가 세 이름 모두 IsNotEmpty로 검증하므로 빈 행은 제외한다.
export const mapEventsToConfigPayload = (events: Array<{ tracker: string; admin: string; media: string; status: number }>) =>
	events
		.filter(event => event.tracker !== '' && event.admin !== '' && event.media !== '')
		.map(event => ({
			tracker_event_name: event.tracker,
			admin_event_name: event.admin,
			media_event_name: event.media,
			send_media: event.status === 1,
		}));

export const mapMediaRow = (row: {
	id: number;
	name: string;
	install_postback_url: string;
	event_postback_url: string;
	campaign?: number;
}) => ({
	idx: String(row.id),
	name: row.name,
	mediaPostbackInstallUrlTemplate: row.install_postback_url,
	mediaPostbackEventUrlTemplate: row.event_postback_url,
	campaign: row.campaign,
});

export const mapTrackerRow = (row: {
	id: number;
	name: string;
	tracking_url: string;
	install_postback_url: string;
	event_postback_url: string;
}) => ({
	idx: String(row.id),
	name: row.name,
	trackerTrackingUrlTemplate: row.tracking_url,
	mecrossPostbackInstallUrlTemplate: row.install_postback_url,
	mecrossPostbackEventUrlTemplate: row.event_postback_url,
});

export const mapAdvertiserRow = (row: { id: number; name: string }) => ({
	idx: String(row.id),
	name: row.name,
});

export const mapAdvertisingInfo = (row: {
	advertiser: string;
	tracker: string;
	advertising: string;
	image: string | null;
	media: string[];
}) => ({
	advertiser: row.advertiser,
	tracker: row.tracker,
	advertising: row.advertising,
	advertisingImageUrl: row.image ?? '',
	media: row.media,
});

export const mapCampaignInfo = (row: {
	id: number;
	token: string;
	name: string;
	type: string;
	is_active: boolean;
	tracker_tracking_url: string;
}) => ({
	idx: String(row.id),
	token: row.token,
	name: row.name,
	type: row.type,
	status: row.is_active ? 1 : 0,
	trackerTrackingUrl: row.tracker_tracking_url,
	mecrossTrackingUrl: '', // backend 응답에 없다 (데이터 갭)
	appkey: '',
	trackerTrackingStatus: 0,
	mecrossTrackingStatus: 0,
	createdAt: '',
	updatedAt: '',
});

/* v8 ignore start -- axios 조회 함수는 순수 로직 테스트 범위 밖이라 커버리지에서 제외 */
const getDashboardData = async (date: string) => {
	const res = await axiosInstance.get(`/dashboard?date=${date}`);
	return res.data.data.map(mapDashboardRow);
};

const getDetail = async (info: { date: (string | null)[]; paramId: string | undefined }) => {
	const { date, paramId } = info;
	const res = await axiosInstance.get(
		`/dashboard/detail/${paramId}?start_date=${date[0]}&end_date=${date[1]}`,
	);
	const dataWithCvr = getDataWithCvr(res.data.data.map(mapDetailRow));
	return dataWithCvr;
};

const getMedia = async () => {
	const res = await axiosInstance.get(`/media`);
	return res.data.data.map(mapMediaRow);
};

const getTrackers = async () => {
	const res = await axiosInstance.get(`/trackers`);
	return res.data.data.map(mapTrackerRow);
};

const getAdvertisers = async () => {
	const res = await axiosInstance.get(`/advertisers`);
	return res.data.data.map(mapAdvertiserRow);
};

const getDaily = async (date: (string | null)[]) => {
	const token = sessionStorage.getItem('detailToken');
	// token은 값이 있을 때만 붙인다 — backend가 빈 token을 400으로 거부한다
	const res = await axiosInstance.get(
		`/dashboard/daily?start_date=${date[0]}&end_date=${date[1]}${token ? `&token=${token}` : ''}`,
	);
	const dataWithCvr = getDataWithCvr(res.data.data.map(mapDailyRow));
	return dataWithCvr;
};

const getDailyDetail = async (info: {
	date: (string | null)[];
	orderType: string;
	order: string;
}) => {
	const { date, orderType, order } = info;
	const token = sessionStorage.getItem('detailToken');
	const res = await axiosInstance.get(
		`/advertising/dailydetail?startDate=${date[0]}&endDate=${date[1]}&type=${orderType}&order=${order}&token=${token}`,
	);
	const dataWithCvr = getDataWithCvr(res.data.data);
	return dataWithCvr;
};

const getChangeCreated = async (paramId?: string) => {
	const res = await axiosInstance.get(`/reservation/on/${paramId}`);
	return res.data.data;
};

const getChangeReserved = async (paramId?: string) => {
	const res = await axiosInstance.get(`/reservation/off/${paramId}`);
	return res.data.data;
};

const getAdvertising = async (obj: {
	searchWords?: string;
}) => {
	const { searchWords } = obj;
	const res = await axiosInstance.get(`/advertising?search=${searchWords}&offset=0&limit=100`);
	return res.data.data.map(mapAdvertisingListItem);
};

const getCampaigns = async (paramId?: string) => {
	const res = await axiosInstance.get(`/campaigns?advertisingId=${paramId}`);
	return res.data.data.map(mapCampaignListItem);
};

const getCampaignEvents = async (campaignIdx?: string) => {
	const res = await axiosInstance.get(`/config/${campaignIdx}`);
	return res.data.data.map(mapConfigRow);
};

export const api = {
	getDashboardData,
	getDetail,
	getMedia,
	getTrackers,
	getAdvertisers,
	getDaily,
	getDailyDetail,
	getChangeCreated,
	getChangeReserved,
	getAdvertising,
	getCampaigns,
	getCampaignEvents,
};
/* v8 ignore stop */
