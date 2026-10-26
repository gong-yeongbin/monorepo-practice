// 매체 포스트백 URL의 {플레이스홀더}를 뽑고 우리 키로 바꿔 끼우는지 검증
import { describe, expect, it } from 'vitest';
import { applyPlaceholderMapping, extractPlaceholders, MEDIA_POSTBACK_KEYS } from './media-postback-template';

describe('extractPlaceholders', () => {
	it('등장 순서대로 중복 없이 뽑는다', () => {
		expect(extractPlaceholders('https://m.io/p?m=1&tid={tid}&e={evt}&t2={tid}')).toEqual(['tid', 'evt']);
	});

	it('플레이스홀더가 없으면 빈 배열이다', () => {
		expect(extractPlaceholders('https://m.io/p?m=1')).toEqual([]);
	});
});

describe('applyPlaceholderMapping', () => {
	it('매핑된 자리만 바꾸고 쿼리 키 이름은 그대로 둔다', () => {
		expect(applyPlaceholderMapping('https://m.io/p?tid={tid}&e={evt}&d={dev}', { tid: 'click_id', evt: 'event_name' })).toBe(
			'https://m.io/p?tid={click_id}&e={event_name}&d={dev}',
		);
	});

	it('같은 이름이 여러 번 나와도 전부 바꾼다', () => {
		expect(applyPlaceholderMapping('a={x}&b={x}', { x: 'token' })).toBe('a={token}&b={token}');
	});
});

describe('MEDIA_POSTBACK_KEYS', () => {
	it('backend media-postback.ts가 치환하는 12개 키와 같다', () => {
		expect(MEDIA_POSTBACK_KEYS).toEqual([
			'click_id',
			'event_name',
			'adid',
			'idfa',
			'android_device_id',
			'ios_device_id',
			'token',
			'pub_id',
			'sub_id',
			'view_code',
			'revenue',
			'currency',
		]);
	});
});
