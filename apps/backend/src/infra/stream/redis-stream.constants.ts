// Redis Stream 인프라에서 공유하는 DI 토큰과 소비 파라미터 상수
export const REDIS_STREAM_CLIENT = Symbol('REDIS_STREAM_CLIENT');

// XREADGROUP 한 번에 읽는 최대 메시지 수와 대기(BLOCK) 시간(ms).
// 배치가 클수록 배치당 upsert SQL 1문장이므로 대량 유입 시 DB 왕복이 줄어든다.
export const STREAM_READ_COUNT = 1000;
export const STREAM_BLOCK_MS = 5000;

// 첫 읽기가 COUNT를 못 채웠을 때 더 모으는 시간(ms).
// XREADGROUP은 1건만 도착해도 즉시 반환하므로 이 대기가 없으면 배치가 사실상 채워지지 않고
// 메시지 수만큼 DB 왕복이 생긴다(문장/s ≈ 컨슈머 수 ÷ 사이클 시간, 사이클 ≈ linger + DB 왕복).
// 늘어나는 비용은 집계 반영 지연뿐이라 일별 리포트에는 영향이 없다.
export const STREAM_LINGER_MS_DEFAULT = 200;

// XADD 시 스트림 길이 상한(approximate 트림). XACK은 엔트리를 지우지 않으므로 없으면 무한 증가한다.
export const STREAM_MAXLEN_DEFAULT = 100_000;

// XAUTOCLAIM으로 회수할 최소 유휴 시간(ms)과, 이 횟수 이상 전달된 메시지를 폐기(poison pill 차단)하는 임계
export const STREAM_CLAIM_MIN_IDLE_MS_DEFAULT = 60_000;
export const STREAM_MAX_DELIVERIES = 3;
