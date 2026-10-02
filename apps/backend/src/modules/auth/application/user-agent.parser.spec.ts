// user_agent 원문을 브라우저·OS·기기 종류로 해석하는 순수 함수 검증(실제 ua-parser-js 사용, 목 없음)
import { parseUserAgent } from './user-agent.parser';

describe('parseUserAgent', () => {
	it('데스크톱 Chrome UA는 브라우저·OS를 읽고 기기 종류는 desktop으로 본다', () => {
		const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
		expect(parseUserAgent(ua)).toEqual({ browser: 'Chrome', os: 'macOS', device_type: 'desktop' });
	});

	it('iPhone Safari UA는 기기 종류를 mobile로 읽는다', () => {
		const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
		expect(parseUserAgent(ua)).toEqual({ browser: 'Mobile Safari', os: 'iOS', device_type: 'mobile' });
	});

	it('user_agent가 없으면 전부 알 수 없음으로 돌려준다', () => {
		expect(parseUserAgent(null)).toEqual({ browser: null, os: null, device_type: 'unknown' });
	});

	it('해석되지 않는 문자열이면 브라우저·OS는 null, 기기 종류는 desktop으로 본다', () => {
		expect(parseUserAgent('curl/8.4.0')).toEqual({ browser: null, os: null, device_type: 'desktop' });
	});
});
