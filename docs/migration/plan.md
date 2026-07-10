# admin-backend → monorepo-practice 이관 계획

## 목적

레거시 `admin-backend`(NestJS 8 + TypeORM + 평면 모듈)의 프론트엔드 제공 API를
`monorepo-practice/apps/backend`(NestJS 11 + Prisma + 클린 아키텍처 4계층)로 이관한다.
단순 복붙이 아니라 **재작성**이다(아래 "왜 복붙이 안 되는가" 참고).

## 원본/목표 위치

- 원본: `/Users/gong-yeongbin/IdeaProjects/admin-backend`
- 목표: `/Users/gong-yeongbin/IdeaProjects/monorepo-practice/apps/backend`

## 왜 복붙이 안 되는가 (재작성 사유)

1. **ORM 교체**: admin-backend 서비스 로직은 전부 TypeORM(Repository/QueryBuilder). Prisma로 다시 쓴다.
2. **아키텍처 교체**: 평면 기능 모듈 → 4계층(domain/application/infrastructure/presentation) + repository 인터페이스+심볼 토큰 패턴(`modules/CLAUDE.md`).
3. **인증 인프라 부재**: monorepo엔 Passport/JWT/가드/인터셉터가 전무. 처음부터 구축.
4. **테스트 규약**: `modules/` 아래 모든 코드는 4지표(statements·branch·functions·lines) 90% 이상 커버리지 필수.
5. **NestJS 8 → 11** API 차이 대응.

## 핵심 결정사항 (구현 전 확정 필요)

### D1. user 스키마 불일치 — ⚠️ 최우선

| | admin-backend `User` 엔티티 | monorepo `user` 모델(Prisma) |
|---|---|---|
| 식별자 | `id` (string, username) | `user_id` (String @unique) |
| 비밀번호 | `password` (bcrypt 해시, ~60자) | `password` (VarChar 20) + `salt` (VarChar 50) |
| 권한 | `type`, `typeIdx` | `role` (enum: ADMIN/ADVERTISER/MEDIA) |

- monorepo `password`가 20자라 **bcrypt 해시(60자)가 안 들어감**. `salt` 컬럼이 별도로 있어 해싱 방식이 다름(bcrypt는 salt를 해시 문자열에 내장하므로 별도 salt 컬럼이 불필요).
- JWT payload도 admin은 `{ id, sub: type }`, monorepo는 `role` 기반이어야 자연스러움.
- **✅ 최종(2026-07-10)**: **bcrypt로 통일**. 착수 시 확인 결과 monorepo에 salt 해싱 구현이 전무했고 `password(20)`이 병목이라 어느 방식이든 마이그레이션 불가피 → 원본과 동일한 bcrypt 선택.
- **스키마 변경**: `user`에서 `salt` 제거, `password` VarChar(20)→VarChar(60). 마이그레이션 SQL은 에이전트가 작성, 적용은 사용자.
- JWT payload는 `role` 기반. LocalStrategy usernameField는 `user_id`.

### D2. 응답 포맷(ResponseInterceptor)
- admin은 전역적으로 `{ statusCode, data, _meta }` 포맷으로 감쌈. monorepo 트래킹 API는 이 래핑이 없음(리다이렉트 위주).
- **✅ 확정(2026-07-10)**: 어드민 API에만 적용(새 어드민 컨트롤러에 `@UseInterceptors`). 전역 등록 안 함. 트래킹 파이프라인 불변.

### D3. reservation / partner 모델 부재
- **정정(2026-07-10, 7단계 착수 시)**: `partner`는 사실 **테이블을 안 쓴다.** admin partner.service는 `PostbackDaily`(=daily_report)를 media/advertiser 기준으로 오늘자 집계하는 조회일 뿐 → **스키마 추가 불필요**. 6단계 통계 패턴 재사용.
- `reservation`은 별도 테이블(`reservation`)이 실제로 필요할 수 있음. 착수 시 admin 코드로 재확인(partner처럼 통계 조회일 가능성도 있으니 추측 말 것).
- 스키마 추가가 진짜 필요한 경우만 마이그레이션: **에이전트가 SQL까지 작성, 적용은 사용자**(`prisma/CLAUDE.md`).

## 이관 순서 (인증 → 단순 도메인 → 복잡 도메인)

의존도·복잡도 오름차순. 각 단계는 검증(테스트 통과 + 90% 커버리지)을 통과해야 다음으로.

```
0. 계획/checklist/context-notes 작성          → verify: 사용자 승인 (현재 단계)
1. 인증 인프라
   - user 도메인(4계층) + JWT/Passport 전략 + 가드 + Response/Token 대응
   - POST /login, POST /user, GET /profile
                                              → verify: 로그인→토큰→/profile e2e + 커버리지
2. advertiser (가장 단순: GET 목록 + 생성)     → verify: 단위+e2e, 커버리지 90%
3. media (GET 목록)                            → verify: 동일
4. tracker (GET 목록) — 이미 trackers/ 있음, 조율 → verify: 동일
5. campaign (CRUD + 이벤트/차단)               → verify: 동일
6. advertising (CRUD + 통계 대시보드 + 엑셀)    → verify: 동일 (엑셀·S3는 별도 판단)
7. partner (스키마 추가 후)                     → verify: 동일
8. reservation (스키마 추가 후)                 → verify: 동일
9. postback 조회 API (트래커 9종 분기)          → verify: 동일
```

> 부수 기능(엑셀 xlsx, S3 image-upload, scheduler)은 해당 도메인 도달 시점에 별도로 범위를 재확인한다. 지금 계획에 포함하지 않는다(단순함 우선).

## 검증 기준(성공 정의)

- 각 도메인: 대응 엔드포인트가 동작하고, 단위 테스트 통과, `modules/` 커버리지 4지표 90% 이상 유지.
- `pnpm --filter backend check-types`, `pnpm --filter backend lint`, `pnpm --filter backend test` 통과.
- 트래킹/포스트백 기존 파이프라인은 **변경 없음**(회귀 없어야 함).

## 범위 밖 (이번 이관에서 하지 않음)

- 프론트엔드 코드.
- AWS CodeDeploy 배포 스크립트(`appspec.yml` 등).
- admin-backend의 scheduler/cron 로직(도달 시 재논의).
