// 광고 상세 화면의 포스트백 엑셀 다운로드용 시트 행·컬럼을 만드는 순수 헬퍼
import dayjs from 'dayjs';
import type { Column } from 'write-excel-file/browser';
import { InstallModalColumns } from '@/shared/ui/modals/install-table';
import { EventModalColumns } from '@/shared/ui/modals/event-table';

// 여러 캠페인이 한 파일에 섞이므로 로그마다 어느 캠페인 것인지 token이 필요하다
export type InstallExportRow = InstallModalColumns & { token: string };
export type EventExportRow = EventModalColumns & { token: string };
export interface UnregisteredExportRow {
	token: string;
	eventName: string;
	count: string;
}

export interface PostbackExportLogs {
	installs: Array<InstallExportRow>;
	events: Array<EventExportRow>;
	unregistered: Array<UnregisteredExportRow>;
}

// token → 캠페인·매체 이름. 광고 상세 표의 행(DetailColumns)이 구조적으로 호환된다.
export interface CampaignName {
	token: string;
	campaignName: string;
	mediaName: string;
}

type Named<Row> = Row & { campaignName: string; mediaName: string };

// 표와 같은 표기. 값이 없으면 빈 칸으로 둔다 — 엑셀에서 '-'는 정렬을 방해한다
const time = (value?: string) => (value ? dayjs(value).format('YY-MM-DD HH:mm:ss') : '');

// 로그 3종에 캠페인·매체 이름을 붙인다. 캠페인은 매체를 하나만 가지므로 token 하나가 둘을 결정한다.
export const buildPostbackSheets = (logs: PostbackExportLogs, campaigns: Array<CampaignName>) => {
	const byToken = new Map(campaigns.map(campaign => [campaign.token, campaign]));

	const withNames = <Row extends { token: string }>(row: Row): Named<Row> => ({
		...row,
		campaignName: byToken.get(row.token)?.campaignName ?? '',
		mediaName: byToken.get(row.token)?.mediaName ?? '',
	});

	return {
		installs: logs.installs.map(withNames),
		events: logs.events.map(withNames),
		unregistered: logs.unregistered.map(withNames),
	};
};

// language·sendUrl은 backend postback 테이블에 없어 항상 빈 값이라 컬럼에서 뺐다(api.tsx의 매퍼 주석 참고)
export const INSTALL_COLUMNS: Array<Column<Named<InstallExportRow>>> = [
	{ header: 'CAMPAIGN', width: 24, cell: row => row.campaignName },
	{ header: 'MEDIA', width: 12, cell: row => row.mediaName },
	{ header: 'CARRIER', width: 12, cell: row => row.carrier },
	{ header: 'DEVICE MODEL', width: 16, cell: row => row.deviceModel },
	{ header: 'MANUFACTURER', width: 16, cell: row => row.deviceManufacturer },
	{ header: 'DEVICE TYPE', width: 14, cell: row => row.deviceType },
	{ header: 'OS', width: 10, cell: row => row.os },
	{ header: 'OS VERSION', width: 12, cell: row => row.osVersion },
	{ header: 'COUNTRY', width: 10, cell: row => row.country },
	{ header: 'IP', width: 16, cell: row => row.ip },
	{ header: 'ADID', width: 38, cell: row => row.adid },
	{ header: 'CLICK ID', width: 38, cell: row => row.clickId },
	{ header: 'VIEW CODE', width: 30, cell: row => row.viewCode },
	{ header: 'PUB ID', width: 14, cell: row => row.pubId },
	{ header: 'SUB ID', width: 16, cell: row => row.subId },
	{ header: 'CLICK TIME', width: 18, cell: row => time(row.clickTime) },
	{ header: 'INSTALL TIME', width: 18, cell: row => time(row.installTime) },
	{ header: 'SENDING TIME', width: 18, cell: row => time(row.sendTime) },
];

export const EVENT_COLUMNS: Array<Column<Named<EventExportRow>>> = [
	{ header: 'CAMPAIGN', width: 24, cell: row => row.campaignName },
	{ header: 'MEDIA', width: 12, cell: row => row.mediaName },
	{ header: 'EVENT', width: 16, cell: row => row.eventName },
	{ header: 'CARRIER', width: 12, cell: row => row.carrier },
	{ header: 'DEVICE MODEL', width: 16, cell: row => row.deviceModel },
	{ header: 'MANUFACTURER', width: 16, cell: row => row.deviceManufacturer },
	{ header: 'DEVICE TYPE', width: 14, cell: row => row.deviceType },
	{ header: 'OS', width: 10, cell: row => row.os },
	{ header: 'OS VERSION', width: 12, cell: row => row.osVersion },
	{ header: 'COUNTRY', width: 10, cell: row => row.country },
	{ header: 'IP', width: 16, cell: row => row.ip },
	{ header: 'ADID', width: 38, cell: row => row.adid },
	{ header: 'CLICK ID', width: 38, cell: row => row.clickId },
	{ header: 'VIEW CODE', width: 30, cell: row => row.viewCode },
	{ header: 'PUB ID', width: 14, cell: row => row.pubId },
	{ header: 'SUB ID', width: 16, cell: row => row.subId },
	{ header: 'EVENT TIME', width: 18, cell: row => time(row.eventTime) },
	{ header: 'INSTALL TIME', width: 18, cell: row => time(row.installTime) },
	{ header: 'SENDING TIME', width: 18, cell: row => time(row.sendTime) },
	{ header: 'REVENUE', width: 12, cell: row => row.revenue },
	{ header: 'CURRENCY', width: 10, cell: row => row.currency ?? '' },
];

// 미등록은 로그 행이 아니라 이벤트명별 카운트 집계다(모달과 동일)
export const UNREGISTERED_COLUMNS: Array<Column<Named<UnregisteredExportRow>>> = [
	{ header: 'CAMPAIGN', width: 24, cell: row => row.campaignName },
	{ header: 'MEDIA', width: 12, cell: row => row.mediaName },
	{ header: 'EVENT', width: 24, cell: row => row.eventName },
	{ header: 'COUNT', width: 10, cell: row => Number(row.count) },
];

export const postbackFileName = (advertising: string, date: Array<string | null>) =>
	`${advertising || 'postback'}_${date[0]}_${date[1]}.xlsx`;
