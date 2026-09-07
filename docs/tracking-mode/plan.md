# 트래킹 차단 모드 (tracking-mode)

## 목적

어드민에서 트래킹 엔드포인트(`GET /tracking`)의 수용 여부를 실시간으로 제어한다.
점검·긴급 차단 상황에서 재배포 없이 즉시 켜고 끄는 것이 목표다.

## 모드

| 모드 | 동작 |
| --- | --- |
| `open` | 정상 — 전부 통과 (기본값) |
| `half` | 요청마다 `Math.random() < 0.5` 로 판정해 평균 절반만 통과 |
| `closed` | 전면 차단 — 전부 503 |

차단된 요청은 `503 Service Unavailable` 로 응답한다.
500 이 아닌 이유는 500 이 "서버 고장" 을 뜻해 트래커·모니터링이 장애로 오인하기 때문이다.

## 저장소

Redis(Valkey) 키 `tracking:mode` 하나. TTL 없음(수동 해제 전까지 유지).

DB 가 아니라 Redis 인 이유.
- 모든 클릭이 읽는 값이라 DB 면 클릭당 쿼리가 하나 붙는다.
- 차단이 필요한 상황은 대개 DB 가 힘들 때인데, 그때 DB 를 읽어야 차단이 되는 구조는 곤란하다.

## 판정 위치

`TrackingController` 에 붙는 NestJS 가드(`TrackingModeGuard`).

미들웨어(`main.ts`)가 아닌 이유.
- DI 로 `CachePort` 를 정상적으로 주입받는다.
- `modules/` 90% 커버리지 강제 대상이라 테스트가 쉬워야 한다.
- `@Public()` 처럼 컨트롤러에 선언적으로 붙는 것이 이 코드베이스 스타일이다.

## 어드민 API

```
GET   /tracking-mode   현재 모드 조회
PATCH /tracking-mode   모드 변경   { "mode": "open" | "half" | "closed" }
```

`@Roles('DEVELOPER')`. 운영 실수로 트래킹이 통째로 멈추는 스위치라 광고 운영 권한(ADMIN)에는 열지 않는다.
트래킹 포트(3002)에서는 `TRACKING_PUBLIC_PATHS` 정규식이 막으므로
어드민 포트(3001)로만 접근된다.

## 실패 정책

- **Redis 장애 시 열어둔다.** 플래그를 못 읽었다고 서비스를 멈출 이유가 없다.
- 마지막으로 읽은 값을 로컬 캐시에 들고 있으므로, 장애 직전 값이 있으면 그것을 계속 쓴다.
- 값이 없거나 알 수 없는 문자열이면 `open` 으로 취급한다.

## 로컬 캐시

각 태스크가 모드 값을 3 초간 메모리에 유지한다.
클릭당 Redis 왕복을 없애기 위함이고, 대가로 반영이 최대 3 초 지연된다.
긴급 차단에 3 초는 허용 범위로 판단했다.

## 범위

`GET /tracking` 만. 포스트백(`/:name/install`·`/:name/event`)은 포함하지 않는다.
`/health` 는 ECS 가 NLB 타깃 그룹 헬스체크에 쓰므로 절대 막지 않는다 — 막으면 태스크가 영구 unhealthy 로 교체를 반복한다.

## 작업 순서

1. `domain/tracking-mode.entity.ts` — 모드 상수·타입·파싱 함수
2. `application/tracking-mode.use-case.ts` — Redis 조회·저장, 로컬 캐시, 폴백
3. `presentation/tracking-mode.guard.ts` — 모드별 통과/확률/503 판정
4. `presentation/tracking-mode.controller.ts` — 어드민 조회·변경 API
5. `tracking.module.ts` 배선 + `TrackingController` 에 가드 부착
6. 각 단계 spec 작성, `pnpm test` 및 커버리지 90% 확인
7. `http/` 호출 파일·README 라우트 표 갱신

프론트 어드민 화면은 이번 범위가 아니다. API 부터 만들고 화면은 별도로 진행한다.
