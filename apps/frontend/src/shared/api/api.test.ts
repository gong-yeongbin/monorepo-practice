// api.tsx의 CVR 파생 로직(getDataWithCvr)과 backend 응답 매퍼 단위 테스트
import { describe, it, expect } from 'vitest';
import {
	getDataWithCvr,
	toCounterStrings,
	platformFromName,
	mapDashboardRow,
	mapDetailRow,
	mapDailyRow,
	mapAdvertisingListItem,
	mapCampaignListItem,
	mapConfigRow,
	mapEventsToConfigPayload,
	mapMediaRow,
	mapTrackerRow,
	mapAdvertiserRow,
	mapAdvertisingInfo,
	mapCampaignInfo,
} from '@/shared/api/api';

// backend 카운터(숫자) 공통 픽스처
const counters = {
	click: 1200,
	install: 60,
	registration: 0,
	retention: 1,
	purchase: 2,
	revenue: 29600,
	etc1: 0,
	etc2: 0,
	etc3: 0,
	etc4: 0,
	etc5: 0,
};

describe('getDataWithCvr', () => {
	it('install / click * 100 을 소수점 2자리로 반올림해 cvr에 채운다', () => {
		const [row] = getDataWithCvr([{ install: '60', click: '1200' }]);
		// 60 / 1200 * 100 = 5
		expect(row.cvr).toBe(5);
	});

	it('반올림은 소수점 2자리에서 이뤄진다', () => {
		const [row] = getDataWithCvr([{ install: '1', click: '3' }]);
		// 1 / 3 * 100 = 33.333... → 33.33
		expect(row.cvr).toBe(33.33);
	});

	it('click이 0이면 0으로 나눠 Infinity가 되므로 0으로 보정한다', () => {
		const [row] = getDataWithCvr([{ install: '10', click: '0' }]);
		expect(row.cvr).toBe(0);
	});

	it('install·click이 숫자가 아니면 NaN이 되므로 0으로 보정한다', () => {
		const [row] = getDataWithCvr([{ install: 'abc', click: 'def' }]);
		expect(row.cvr).toBe(0);
	});

	it('여러 행을 각각 계산한다', () => {
		const rows = getDataWithCvr([
			{ install: '50', click: '100' },
			{ install: '25', click: '100' },
		]);
		expect(rows.map((r: { cvr: number }) => r.cvr)).toEqual([50, 25]);
	});

	it('원본 배열과 다른 새 배열을 반환한다(얕은 복사)', () => {
		const input = [{ install: '60', click: '1200' }];
		const output = getDataWithCvr(input);
		expect(output).not.toBe(input);
	});
});

describe('toCounterStrings', () => {
	it('숫자 카운터 11개를 전부 문자열로 변환한다', () => {
		expect(toCounterStrings(counters)).toEqual({
			click: '1200',
			install: '60',
			registration: '0',
			retention: '1',
			purchase: '2',
			revenue: '29600',
			etc1: '0',
			etc2: '0',
			etc3: '0',
			etc4: '0',
			etc5: '0',
		});
	});
});

describe('platformFromName', () => {
	it('(iOS) 접미사는 iOS를 반환한다', () => {
		expect(platformFromName('티몬 (iOS)')).toBe('iOS');
	});

	it('(AOS) 접미사는 AOS를 반환한다', () => {
		expect(platformFromName('티몬 (AOS)')).toBe('AOS');
	});

	it('접미사가 없으면 빈 문자열을 반환한다', () => {
		expect(platformFromName('티몬')).toBe('');
	});
});

describe('mapDashboardRow', () => {
	it('advertising_id·advertising_name을 idx·name으로 매핑하고 platform을 파생한다', () => {
		const row = mapDashboardRow({ ...counters, advertising_id: 46, advertising_name: '티몬_CPA (AOS)' });
		expect(row).toMatchObject({ idx: '46', name: '티몬_CPA (AOS)', platform: 'AOS', click: '1200' });
	});
});

describe('mapDetailRow', () => {
	const backendRow = {
		...counters,
		campaign_id: 333,
		campaign_name: '반려의고수_구매',
		type: 'CPA',
		is_active: true,
		media_id: 7,
		media_name: 'vikingmedia',
		token: 'tok123',
		unregistered: 3,
	};

	it('snake_case 필드를 레거시 camelCase로 매핑한다', () => {
		expect(mapDetailRow(backendRow)).toMatchObject({
			campaignIdx: '333',
			campaignName: '반려의고수_구매',
			type: 'CPA',
			status: 1,
			createdAt: '',
			mediaIdx: '7',
			mediaName: 'vikingmedia',
			token: 'tok123',
			unregistered: '3',
			click: '1200',
		});
	});

	it('is_active가 false면 status 0으로 매핑한다', () => {
		expect(mapDetailRow({ ...backendRow, is_active: false }).status).toBe(0);
	});
});

describe('mapDailyRow', () => {
	it('created_date를 createdAt으로, unregistered를 문자열로 매핑한다', () => {
		const row = mapDailyRow({ ...counters, created_date: '2026-07-21T00:00:00.000Z', unregistered: 5 });
		expect(row).toMatchObject({ createdAt: '2026-07-21T00:00:00.000Z', unregistered: '5', install: '60' });
	});
});

describe('mapAdvertisingListItem', () => {
	const backendRow = { id: 78, name: '반려의고수 (AOS)', image: 'http://img', status: true, campaign: 3 };

	it('id·status(boolean)를 idx·status(0|1)로 매핑한다', () => {
		expect(mapAdvertisingListItem(backendRow)).toMatchObject({
			idx: '78',
			name: '반려의고수 (AOS)',
			platform: 'AOS',
			imageUrl: 'http://img',
			status: 1,
			campaign: 3,
		});
	});

	it('status가 false면 0으로 매핑한다', () => {
		expect(mapAdvertisingListItem({ ...backendRow, status: false }).status).toBe(0);
	});
});

describe('mapCampaignListItem', () => {
	const backendRow = {
		campaign_id: 333,
		token: 'tok123',
		campaign_name: '캠페인A',
		type: 'CPA',
		is_active: true,
		media_name: 'vikingmedia',
	};

	it('campaign_* 필드를 레거시 캠페인 컬럼으로 매핑한다', () => {
		expect(mapCampaignListItem(backendRow)).toEqual({
			campaignIdx: '333',
			token: 'tok123',
			campaignName: '캠페인A',
			campaignType: 'CPA',
			campaignStatus: 1,
			campaignBlock: 0,
			mediaName: 'vikingmedia',
			trackerName: '',
		});
	});

	it('is_active가 false면 campaignStatus 0으로 매핑한다', () => {
		expect(mapCampaignListItem({ ...backendRow, is_active: false }).campaignStatus).toBe(0);
	});
});

describe('mapConfigRow', () => {
	it('config 이벤트 매핑을 레거시 이벤트 행으로 변환한다', () => {
		expect(
			mapConfigRow({
				tracker_event_name: 'af_purchase',
				admin_event_name: 'purchase',
				media_event_name: 'purchase',
				send_media: true,
			}),
		).toEqual({ tracker: 'af_purchase', admin: 'purchase', media: 'purchase', status: 1 });
	});

	it('send_media가 false면 status 0으로 매핑한다', () => {
		expect(
			mapConfigRow({ tracker_event_name: 'a', admin_event_name: 'b', media_event_name: 'c', send_media: false })
				.status,
		).toBe(0);
	});
});

describe('mapEventsToConfigPayload', () => {
	it('레거시 이벤트 행을 config PATCH body로 역변환한다', () => {
		expect(mapEventsToConfigPayload([{ tracker: 'af_purchase', admin: 'purchase', media: 'purchase', status: 1 }])).toEqual([
			{
				tracker_event_name: 'af_purchase',
				admin_event_name: 'purchase',
				media_event_name: 'purchase',
				send_media: true,
			},
		]);
	});

	it('status가 1이 아니면 send_media false로 변환한다', () => {
		expect(mapEventsToConfigPayload([{ tracker: 'a', admin: 'b', media: 'c', status: 0 }])[0].send_media).toBe(false);
	});

	it('빈 이름이 있는 행은 제외한다(backend IsNotEmpty)', () => {
		expect(
			mapEventsToConfigPayload([
				{ tracker: '', admin: 'b', media: 'c', status: 1 },
				{ tracker: 'a', admin: '', media: 'c', status: 1 },
				{ tracker: 'a', admin: 'b', media: '', status: 1 },
			]),
		).toEqual([]);
	});
});

describe('mapMediaRow', () => {
	it('포스트백 URL 필드를 레거시 템플릿 필드명으로 매핑한다', () => {
		expect(
			mapMediaRow({
				id: 7,
				name: 'vikingmedia',
				install_postback_url: 'http://install',
				event_postback_url: 'http://event',
				campaign: 2,
			}),
		).toEqual({
			idx: '7',
			name: 'vikingmedia',
			mediaPostbackInstallUrlTemplate: 'http://install',
			mediaPostbackEventUrlTemplate: 'http://event',
			campaign: 2,
		});
	});
});

describe('mapTrackerRow', () => {
	it('tracking_url·postback URL을 레거시 템플릿 필드명으로 매핑한다', () => {
		expect(
			mapTrackerRow({
				id: 3,
				name: 'appsflyer',
				tracking_url: 'http://track',
				install_postback_url: 'http://install',
				event_postback_url: 'http://event',
			}),
		).toEqual({
			idx: '3',
			name: 'appsflyer',
			trackerTrackingUrlTemplate: 'http://track',
			mecrossPostbackInstallUrlTemplate: 'http://install',
			mecrossPostbackEventUrlTemplate: 'http://event',
		});
	});
});

describe('mapAdvertiserRow', () => {
	it('id를 문자열 idx로 매핑한다', () => {
		expect(mapAdvertiserRow({ id: 5, name: '플레이디' })).toEqual({ idx: '5', name: '플레이디' });
	});
});

describe('mapAdvertisingInfo', () => {
	const backendInfo = {
		advertiser: '플레이디',
		tracker: 'airbridge',
		advertising: '반려의고수 (AOS)',
		image: 'http://img',
		media: ['vikingmedia'],
	};

	it('image를 advertisingImageUrl로 매핑한다', () => {
		expect(mapAdvertisingInfo(backendInfo)).toEqual({
			advertiser: '플레이디',
			tracker: 'airbridge',
			advertising: '반려의고수 (AOS)',
			advertisingImageUrl: 'http://img',
			media: ['vikingmedia'],
		});
	});

	it('image가 null이면 빈 문자열로 채운다', () => {
		expect(mapAdvertisingInfo({ ...backendInfo, image: null }).advertisingImageUrl).toBe('');
	});
});

describe('mapCampaignInfo', () => {
	const backendCampaign = {
		id: 333,
		token: 'tok123',
		name: '캠페인A',
		type: 'CPA',
		is_active: true,
		tracker_tracking_url: 'http://track',
	};

	it('캠페인 응답을 InfoCard의 SecondInfo 형태로 매핑한다', () => {
		expect(mapCampaignInfo(backendCampaign)).toMatchObject({
			idx: '333',
			token: 'tok123',
			name: '캠페인A',
			type: 'CPA',
			status: 1,
			trackerTrackingUrl: 'http://track',
			mecrossTrackingUrl: '',
		});
	});

	it('is_active가 false면 status 0으로 매핑한다', () => {
		expect(mapCampaignInfo({ ...backendCampaign, is_active: false }).status).toBe(0);
	});
});
