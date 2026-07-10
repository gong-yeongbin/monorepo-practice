// Redis Stream 인프라에서 공유하는 DI 토큰과 소비 파라미터 상수
export const REDIS_STREAM_CLIENT = Symbol('REDIS_STREAM_CLIENT');

// XREADGROUP 한 번에 읽는 최대 메시지 수와 대기(BLOCK) 시간(ms)
export const STREAM_READ_COUNT = 100;
export const STREAM_BLOCK_MS = 5000;
