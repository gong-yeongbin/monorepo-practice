// 여러 모듈(tracking 조회·campaign 무효화)이 공유하는 Redis 캐시 키 생성 순수 함수
export const campaignCacheKey = (token: string): string => `campaign:${token}`;

// 전역 트래킹 모드 — 캠페인별이 아니라 하나뿐이라 인자가 없다
export const TRACKING_MODE_CACHE_KEY = 'tracking:mode';
