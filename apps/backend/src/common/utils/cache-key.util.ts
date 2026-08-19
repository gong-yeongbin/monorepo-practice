// 여러 모듈(tracking 조회·campaign 무효화)이 공유하는 Redis 캐시 키 생성 순수 함수
export const campaignCacheKey = (token: string): string => `campaign:${token}`;
