// createPostback 팩토리가 tracker 필드(camelCase)를 저장용 snake_case로 매핑하는지 검증
import { createPostback } from './postback.entity';

describe('createPostback', () => {
	const base = {
		trackerName: 'appsflyer',
		eventName: 'purchase',
		clickId: 'click-1',
		viewCode: 'vc-1',
		token: 'token-1',
		adid: 'adid-1',
		idfa: 'idfa-1',
		ip: '1.1.1.1',
		countryCode: 'KR',
		pubId: 'pub-1',
		subId: 'sub-1',
		rawQueryParams: '{"a":"b"}',
		installedAt: '2026-07-10',
	};

	it('camelCase 트래커 필드를 snake_case postback으로 매핑한다', () => {
		const postback = createPostback(base);

		expect(postback).toMatchObject({
			tracker_name: 'appsflyer',
			event_name: 'purchase',
			click_id: 'click-1',
			pub_id: 'pub-1',
			sub_id: 'sub-1',
			view_code: 'vc-1',
			token: 'token-1',
			adid: 'adid-1',
			idfa: 'idfa-1',
			ip: '1.1.1.1',
			country_code: 'KR',
			installed_at: '2026-07-10',
			raw_query_params: '{"a":"b"}',
		});
	});

	it('선택 시각·수익 필드가 없으면 null로 채운다', () => {
		const postback = createPostback(base);

		expect(postback.clicked_at).toBeNull();
		expect(postback.evented_at).toBeNull();
		expect(postback.revenue_currency).toBeNull();
		expect(postback.revenue).toBeNull();
	});

	it('선택 시각·수익 필드가 있으면 그대로 반영한다', () => {
		const postback = createPostback({
			...base,
			clickedAt: '2026-07-09',
			eventedAt: '2026-07-11',
			revenueCurrency: 'USD',
			revenue: '1000',
		});

		expect(postback.clicked_at).toBe('2026-07-09');
		expect(postback.evented_at).toBe('2026-07-11');
		expect(postback.revenue_currency).toBe('USD');
		expect(postback.revenue).toBe('1000');
	});
});
