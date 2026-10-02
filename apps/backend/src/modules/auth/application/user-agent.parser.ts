// user_agent 원문을 브라우저·OS·기기 종류로 해석한다. 저장은 원문만 하고 해석은 조회 시점에 한다(login_history 설계 참고).
import { UAParser } from 'ua-parser-js';

export interface UserAgentInfo {
	browser: string | null;
	os: string | null;
	// 'desktop' | 'mobile' | 'tablet' 등. UA로는 기기 모델까지 알 수 없다(iPhone은 전부 'iPhone', 데스크톱은 전부 'desktop')
	device_type: string;
}

export function parseUserAgent(user_agent: string | null): UserAgentInfo {
	if (!user_agent) {
		return { browser: null, os: null, device_type: 'unknown' };
	}
	const { browser, os, device } = UAParser(user_agent);
	// ua-parser-js는 데스크톱을 type으로 표시하지 않는다(undefined) — mobile·tablet 등이 아니면 desktop으로 본다
	return { browser: browser.name ?? null, os: os.name ?? null, device_type: device.type ?? 'desktop' };
}
