// parseAccessToken이 JWT payload를 읽고 잘못된 입력은 null로 흘리는지 검증
import { afterEach, describe, expect, it } from 'vitest';
import { getAuthUser, parseAccessToken } from './auth';

// 서명은 검증하지 않으므로 header·signature 자리는 아무 값이나 둔다
const tokenWith = (payload: string) => `header.${payload}.signature`;

describe('parseAccessToken', () => {
	it('payload에서 email·role을 읽는다', () => {
		const payload = btoa(JSON.stringify({ sub: 1, email: 'admin@test.com', role: 'DEVELOPER' }));

		expect(parseAccessToken(tokenWith(payload))).toEqual({ sub: 1, email: 'admin@test.com', role: 'DEVELOPER' });
	});

	it('base64url의 -·_를 표준 base64 문자로 치환해 디코드한다', () => {
		const payload = btoa(JSON.stringify({ email: 'a+b/c@test.com', role: 'USER' }))
			.replace(/\+/g, '-')
			.replace(/\//g, '_');

		expect(parseAccessToken(tokenWith(payload))).toEqual({ email: 'a+b/c@test.com', role: 'USER' });
	});

	it('토큰이 없으면 null을 반환한다', () => {
		expect(parseAccessToken(null)).toBeNull();
	});

	it('payload가 깨졌으면 null을 반환한다', () => {
		expect(parseAccessToken('not-a-jwt')).toBeNull();
		expect(parseAccessToken(tokenWith('!!!not-base64!!!'))).toBeNull();
	});
});

describe('getAuthUser', () => {
	afterEach(() => sessionStorage.clear());

	it('sessionStorage의 accessToken을 읽어 사용자를 반환한다', () => {
		sessionStorage.setItem('accessToken', tokenWith(btoa(JSON.stringify({ email: 'ops@test.com', role: 'ADMIN' }))));

		expect(getAuthUser()).toEqual({ email: 'ops@test.com', role: 'ADMIN' });
	});

	it('로그인하지 않았으면 null을 반환한다', () => {
		expect(getAuthUser()).toBeNull();
	});
});
