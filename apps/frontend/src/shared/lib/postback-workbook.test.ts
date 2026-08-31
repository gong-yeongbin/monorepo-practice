// postback-workbook.ts의 캠페인 이름 조인·컬럼 매핑 단위 테스트
import { describe, it, expect } from 'vitest';
import {
	buildPostbackSheets,
	postbackFileName,
	INSTALL_COLUMNS,
	EVENT_COLUMNS,
	UNREGISTERED_COLUMNS,
	PostbackExportLogs,
} from '@/shared/lib/postback-workbook';

const campaigns = [
	{ token: 'tok-a', campaignName: '캠페인 A', mediaName: '매체 A' },
	{ token: 'tok-b', campaignName: '캠페인 B', mediaName: '매체 B' },
];

const installRow = {
	token: 'tok-a',
	carrier: '',
	country: 'KR',
	language: '',
	ip: '1.2.3.4',
	adid: 'adid-1',
	clickId: 'click-1',
	viewCode: 'view-1',
	pubId: 'pub-1',
	subId: 'sub-1',
	clickTime: '2026-07-01T00:00:00+09:00',
	installTime: '2026-07-01T01:02:03+09:00',
	sendTime: '',
};

const eventRow = { ...installRow, eventName: 'af_purchase', eventTime: '2026-07-02T10:20:30+09:00', revenue: 1500, currency: 'KRW' };

const logs: PostbackExportLogs = {
	installs: [installRow, { ...installRow, token: 'unknown' }],
	events: [eventRow],
	unregistered: [{ token: 'tok-b', eventName: 'af_custom', count: '3' }],
};

// 컬럼 정의를 한 행에 적용해 헤더 순서대로 셀 값을 뽑는다
const cellsOf = <Row,>(columns: Array<{ header?: unknown; cell: (row: Row, index: number) => unknown }>, row: Row) =>
	columns.map(column => column.cell(row, 0));

describe('buildPostbackSheets', () => {
	it('token으로 캠페인·매체 이름을 붙인다', () => {
		const sheets = buildPostbackSheets(logs, campaigns);

		expect(sheets.installs[0]).toMatchObject({ campaignName: '캠페인 A', mediaName: '매체 A' });
		expect(sheets.events[0]).toMatchObject({ campaignName: '캠페인 A', mediaName: '매체 A' });
		expect(sheets.unregistered[0]).toMatchObject({ campaignName: '캠페인 B', mediaName: '매체 B' });
	});

	it('목록에 없는 token은 빈 이름으로 둔다', () => {
		const sheets = buildPostbackSheets(logs, campaigns);

		expect(sheets.installs[1]).toMatchObject({ campaignName: '', mediaName: '' });
	});
});

describe('컬럼 매핑', () => {
	const [installs, events, unregistered] = (() => {
		const sheets = buildPostbackSheets(logs, campaigns);
		return [sheets.installs, sheets.events, sheets.unregistered];
	})();

	it('install 컬럼은 시각을 표와 같은 형식으로 쓰고, 값이 없으면 빈 칸으로 둔다', () => {
		expect(cellsOf(INSTALL_COLUMNS, installs[0])).toEqual([
			'캠페인 A',
			'매체 A',
			'KR',
			'1.2.3.4',
			'adid-1',
			'click-1',
			'view-1',
			'pub-1',
			'sub-1',
			'26-07-01 00:00:00',
			'26-07-01 01:02:03',
			'',
		]);
	});

	it('event 컬럼은 이벤트명·매출까지 담는다', () => {
		expect(cellsOf(EVENT_COLUMNS, events[0])).toEqual([
			'캠페인 A',
			'매체 A',
			'af_purchase',
			'KR',
			'1.2.3.4',
			'adid-1',
			'click-1',
			'view-1',
			'pub-1',
			'sub-1',
			'26-07-02 10:20:30',
			'26-07-01 01:02:03',
			'',
			1500,
			'KRW',
		]);
	});

	it('currency가 없으면 빈 칸으로 둔다', () => {
		expect(cellsOf(EVENT_COLUMNS, { ...events[0], currency: undefined })).toContain('');
	});

	it('미등록 컬럼은 카운트를 숫자로 쓴다', () => {
		expect(cellsOf(UNREGISTERED_COLUMNS, unregistered[0])).toEqual(['캠페인 B', '매체 B', 'af_custom', 3]);
	});
});

describe('postbackFileName', () => {
	it('광고명과 기간으로 파일명을 만든다', () => {
		expect(postbackFileName('테스트광고', ['2026-07-01', '2026-07-10'])).toBe('테스트광고_2026-07-01_2026-07-10.xlsx');
	});

	it('광고명이 비어 있으면 postback으로 대체한다', () => {
		expect(postbackFileName('', ['2026-07-01', '2026-07-10'])).toBe('postback_2026-07-01_2026-07-10.xlsx');
	});
});
