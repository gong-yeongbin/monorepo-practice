// Redis Stream 인프라에서 공유하는 DI 토큰과 소비 파라미터 상수
export const REDIS_STREAM_CLIENT = Symbol('REDIS_STREAM_CLIENT');

// XREADGROUP 한 번에 읽는 최대 메시지 수와 대기(BLOCK) 시간(ms).
// 배치가 클수록 배치당 upsert SQL 1문장이므로 대량 유입 시 DB 왕복이 줄어든다.
//
// 1000에서 올렸다. 적체가 쌓인 상태인데도 읽기 사이에 빈 xreadgroup이 끼어 BLOCK을 5초씩
// 소진하는 것이 관측되어(사이클 10~20초, 그중 실제 처리는 90ms), 읽기 1회가 가져오는 양을
// 늘려 대기 시간에 눌리지 않게 한다. 5000건이 만드는 daily_report 행은 실측 기준 약 750개라
// 바인드 파라미터가 12,750개로 PostgreSQL 상한(65,535)에 여유가 크고, 핸들러도 약 450ms다.
export const STREAM_READ_COUNT = 5000;
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
