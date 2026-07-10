// createDailyReport 팩토리가 카운터를 0으로 초기화한 빈 리포트를 만드는지 검증
import { createDailyReport } from './daily-report.entity';

describe('createDailyReport (postback)', () => {
	it('식별 필드는 그대로 두고 모든 카운터를 0으로 초기화한다', () => {
		const created_date = new Date('2026-07-10T00:00:00.000Z');
		const report = createDailyReport({ view_code: 'vc-1', token: 'token-1', pub_id: 'pub-1', sub_id: 'sub-1', created_date });

		expect(report).toEqual({
			view_code: 'vc-1',
			token: 'token-1',
			pub_id: 'pub-1',
			sub_id: 'sub-1',
			created_date,
			click: 0,
			install: 0,
			registration: 0,
			retention: 0,
			purchase: 0,
			revenue: 0,
			etc1: 0,
			etc2: 0,
			etc3: 0,
			etc4: 0,
			etc5: 0,
			unregistered: 0,
		});
	});

	it('pub_id·sub_id가 null이어도 그대로 유지한다', () => {
		const report = createDailyReport({ view_code: 'vc-2', token: 'token-2', pub_id: null, sub_id: null, created_date: new Date() });

		expect(report.pub_id).toBeNull();
		expect(report.sub_id).toBeNull();
	});
});
