// 매체 포스트백 URL 템플릿의 {플레이스홀더} 추출·치환 — backend가 치환하는 키 목록과 정규식을 맞춘다
// (apps/backend/src/modules/postback/domain/media-postback.ts의 buildMediaPostbackUrl)
export const MEDIA_POSTBACK_KEYS = [
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
] as const;

export type MediaPostbackKey = (typeof MEDIA_POSTBACK_KEYS)[number];

const PLACEHOLDER = /\{(\w+)\}/g;

export const extractPlaceholders = (url: string): string[] => [...new Set([...url.matchAll(PLACEHOLDER)].map(m => m[1]))];

// mapping에 없는 자리는 그대로 둔다(backend가 모르는 키는 빈 문자열로 보낸다)
export const applyPlaceholderMapping = (url: string, mapping: Record<string, string>): string =>
	url.replace(PLACEHOLDER, (whole, name: string) => (mapping[name] ? `{${mapping[name]}}` : whole));
