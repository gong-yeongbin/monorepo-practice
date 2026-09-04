// buildMediaPostbackUrl이 admin_event_name에 따라 템플릿을 고르고 플레이스홀더를 인코딩 치환하는지 검증
import { buildMediaPostbackUrl } from './media-postback';
import { Media } from './campaign.entity';
import { CampaignConfig } from './campaign-config.entity';
import { Postback } from './postback.entity';

describe('buildMediaPostbackUrl', () => {
	const media: Media = {
		install_postback_url: 'https://media.example.com/install?click_id={click_id}',
		event_postback_url: 'https://media.example.com/event?click_id={click_id}&event={event}',
	};

	const config = (overrides: Partial<CampaignConfig> = {}): CampaignConfig => ({
		id: 1,
		send_media: true,
		tracker_event_name: 'af_purchase',
		admin_event_name: 'purchase',
		media_event_name: 'media_purchase',
		campaign_id: 1,
		...overrides,
	});

	const postback = (overrides: Partial<Postback> = {}): Postback =>
		({
			click_id: 'click-1',
			pub_id: 'pub-1',
			sub_id: 'sub-1',
			view_code: 'vc-1',
			token: 'token-1',
			adid: 'adid-1',
			idfa: 'idfa-1',
			revenue_currency: 'USD',
			revenue: '1000',
			...overrides,
		}) as Postback;

	it("admin_event_name이 'install'이면 install 템플릿을 쓴다", () => {
		const url = buildMediaPostbackUrl(media, config({ admin_event_name: 'install' }), postback());
		expect(url).toBe('https://media.example.com/install?click_id=click-1');
	});

	it("install이 아니면 event 템플릿을 쓰고 {event}는 media_event_name으로 치환한다", () => {
		const url = buildMediaPostbackUrl(media, config(), postback());
		expect(url).toBe('https://media.example.com/event?click_id=click-1&event=media_purchase');
	});

	it('params에 없는 플레이스홀더는 빈 문자열로 치환한다', () => {
		const url = buildMediaPostbackUrl({ ...media, event_postback_url: 'https://m.example.com/e?x={unknown_key}&event={event}' }, config(), postback());
		expect(url).toBe('https://m.example.com/e?x=&event=media_purchase');
	});

	it('null 필드(adid·pub_id·revenue 등)는 빈 문자열로 치환한다', () => {
		const template = 'https://m.example.com/e?adid={adid}&pub={pub_id}&rev={revenue}&cur={currency}';
		const url = buildMediaPostbackUrl({ ...media, event_postback_url: template }, config(), postback({ adid: null, pub_id: null, revenue: null, revenue_currency: null }));
		expect(url).toBe('https://m.example.com/e?adid=&pub=&rev=&cur=');
	});

	it('값의 특수문자는 encodeURIComponent로 인코딩한다', () => {
		const url = buildMediaPostbackUrl(media, config(), postback({ click_id: 'a b&c=d' }));
		expect(url).toBe('https://media.example.com/event?click_id=a%20b%26c%3Dd&event=media_purchase');
	});

	// DB에는 URL 인코딩을 푼 원문이 저장되지만, 매체가 받는 view_code 값은 트래킹 URL과 같은 인코딩된 형태여야 한다.
	// 값을 먼저 인코딩한 뒤 치환 인코딩이 한 번 더 걸리므로 URL상으로는 %252F가 된다(매체가 디코드하면 %2F 형태).
	it('view_code는 인코딩된 값을 매체에 전달한다(치환 인코딩까지 두 번)', () => {
		const eventMedia: Media = { ...media, event_postback_url: 'https://media.example.com/event?view_code={view_code}' };
		const url = buildMediaPostbackUrl(eventMedia, config(), postback({ view_code: 'yiBlMXo/DLnd+YRE=' }));
		expect(url).toBe('https://media.example.com/event?view_code=yiBlMXo%252FDLnd%252BYRE%253D');
		expect(decodeURIComponent('yiBlMXo%252FDLnd%252BYRE%253D')).toBe('yiBlMXo%2FDLnd%2BYRE%3D');
	});
});
