// Redis Stream 인프라에서 공유하는 DI 토큰과 소비 파라미터 상수
export const REDIS_STREAM_CLIENT = Symbol('REDIS_STREAM_CLIENT');

// XREADGROUP 한 번에 읽는 최대 메시지 수와 대기(BLOCK) 시간(ms)
export const STREAM_READ_COUNT = 100;
export const STREAM_BLOCK_MS = 5000;

// XADD 시 스트림 길이 상한(approximate 트림). XACK은 엔트리를 지우지 않으므로 없으면 무한 증가한다.
export const STREAM_MAXLEN_DEFAULT = 100_000;

// XAUTOCLAIM으로 회수할 최소 유휴 시간(ms)과, 이 횟수 이상 전달된 메시지를 폐기(poison pill 차단)하는 임계
export const STREAM_CLAIM_MIN_IDLE_MS_DEFAULT = 60_000;
export const STREAM_MAX_DELIVERIES = 3;
