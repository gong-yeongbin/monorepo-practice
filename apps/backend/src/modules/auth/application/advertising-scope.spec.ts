import { AccessTokenPayload } from '@auth/application/token.constants';
import { advertisingScopeOf, isAdvertisingAllowed } from './advertising-scope';

describe('advertisingScopeOf', () => {
	const payload = (overrides: Partial<AccessTokenPayload>): AccessTokenPayload => ({ sub: 1, email: 'a@test.com', role: 'USER', advertising_ids: [], ...overrides });

	it('USER는 허용 광고 목록을 그대로 스코프로 쓴다', () => {
		expect(advertisingScopeOf(payload({ role: 'USER', advertising_ids: [1, 2] }))).toEqual([1, 2]);
	});

	it('USER의 허용 목록이 비면 빈 배열이다(전체 허용 아님)', () => {
		expect(advertisingScopeOf(payload({ role: 'USER', advertising_ids: [] }))).toEqual([]);
	});

	// advertising_ids가 없던 시절 발급된 access token이 만료(15분) 전까지 살아 있다.
	// 이때 undefined를 면제로 흘리면 스코핑이 뚫리므로 빈 배열로 떨어뜨려 차단한다.
	it('advertising_ids가 없는 구 토큰의 USER는 빈 배열로 차단한다', () => {
		const legacy = { sub: 1, email: 'a@test.com', role: 'USER' } as AccessTokenPayload;

		expect(advertisingScopeOf(legacy)).toEqual([]);
	});

	it.each(['DEVELOPER', 'ADMIN'] as const)('%s는 스코핑 면제라 undefined다', (role) => {
		expect(advertisingScopeOf(payload({ role, advertising_ids: [1] }))).toBeUndefined();
	});
});

describe('isAdvertisingAllowed', () => {
	it('스코프가 undefined면(면제) 항상 허용한다', () => {
		expect(isAdvertisingAllowed(undefined, 999)).toBe(true);
	});

	it('스코프에 포함되면 허용한다', () => {
		expect(isAdvertisingAllowed([1, 2], 2)).toBe(true);
	});

	it('스코프 밖이면 거부한다', () => {
		expect(isAdvertisingAllowed([1, 2], 3)).toBe(false);
	});

	it('빈 스코프는 무엇도 허용하지 않는다', () => {
		expect(isAdvertisingAllowed([], 1)).toBe(false);
	});
});
