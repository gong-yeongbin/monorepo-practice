# prisma

`schema.prisma`(단일 스키마)와 `migrations/`(적용 이력). MySQL 대상이며 domain·repository는 이 스키마에서 파생된 Prisma 생성 타입을 그대로 쓴다(`modules/CLAUDE.md`의 도메인 타입 규칙 참고).

## 명령어 (`apps/backend`에서 실행)

- `pnpm migrate` — `prisma migrate dev --create-only`. **SQL만 생성하고 적용은 하지 않는다.** 생성된 migration.sql을 검토한 뒤 `pnpm deploy`로 적용한다.
- `pnpm deploy` — `prisma migrate deploy`. 미적용 마이그레이션을 순서대로 적용.
- `pnpm generate` — Prisma Client 재생성. **스키마를 바꾸면 반드시 실행**해야 타입이 맞는다(빌드/타입체크 전 필수).
- `pnpm reset` — DB 초기화. **데이터가 삭제되므로** 로컬에서만. 초기화 후 seed가 자동 실행된다.
- `pnpm seed` — `seed.ts` 실행(로컬 테스트 데이터 생성). upsert 기반이라 재실행해도 안전. 로그인 가능한 유저(`admin@test.com` / `test1234!`, `approved: true`)와 advertiser→tracker→media→advertising→campaign→campaign_config 그래프, daily_report 7일치를 만든다.

**이 Prisma 명령어(`migrate`/`deploy`/`generate`/`reset`/`seed`)는 에이전트가 직접 실행하지 않고 사용자가 직접 실행한다.** 실제 DB에 연결·변경을 가하고 `.env`의 `DATABASE_URL`에 의존하기 때문이다. 에이전트는 `schema.prisma` 수정과 마이그레이션 `migration.sql`을 손으로 작성하는 데까지만 하고, 적용(`deploy` 등)은 사용자에게 명령어를 안내한다. 사용자가 세션에서 직접 돌리려면 `!` 접두사로 실행하면 된다(예: `! pnpm deploy`).

## datasource url은 schema가 아니라 config/service에서 주입 (주의)

`datasource db`에는 `provider = "mysql"`만 있고 **`url`이 없다.** Prisma 7에선 schema에 url을 둘 수 없다. 여기에 `url = env("DATABASE_URL")`을 추가하지 말 것. url은 두 경로로 주입된다.

- **마이그레이션·CLI**(`migrate`/`deploy`/`reset`/`generate`): `prisma.config.ts`가 `process.env.DATABASE_URL`을 주입한다. `.env`에 `DATABASE_URL`이 있어야 동작한다.
- **런타임 앱 연결**: `PrismaService`가 driver adapter `PrismaMariaDb(process.env.DATABASE_URL)`로 직접 만든다(`src/infra/prisma/prisma.service.ts`).

## 스키마 규칙 (기존 컨벤션 유지)

- 모델명·컬럼명은 **snake_case**(예: `daily_report`, `tracker_name`, `created_date`). domain 타입이 이 이름을 그대로 쓰므로 어긴 뒤 매핑을 손으로 맞추지 말 것.
- 컬럼 타입은 `@db.VarChar(n)`, `@db.Text`, `@db.Date`, `@db.DateTime` 등으로 **명시**한다.
- enum은 파일 하단에 모아 둔다(`Role`, `Type`). enum 값은 대문자.
- 집계 카운터(`daily_report`의 click/install/…)는 `Int @default(0)`. upsert의 `increment`로 누산한다(`prisma-daily-report.repository.ts`).
- 복합 unique는 `@@unique([...])`. 예: `daily_report`의 `[view_code, created_date]`(일자별 유일), `campaign_config`의 `[campaign_id, admin_event_name]`.

## 의도적 설계 (결함처럼 보이지만 그대로 둘 것)

- **`daily_report`의 관계가 `campaign_id`가 아니라 `token`으로 연결됨** — tracking consumer는 클릭 집계 시 campaign을 조회하지 않고 viewCode에서 디코드한 token만으로 upsert한다. FK를 campaign_id로 바꾸면 트래킹 핫패스에 DB 조회가 강제되어 성능이 나빠진다. `campaign.token`은 uuid 기본값이라 잘 바뀌지 않는다.
- **`postback.revenue`는 `String`, `daily_report.revenue`는 `Int`** — postback은 트래커 원본 매출(소수·통화 혼재 가능)을 손실 없이 보존한다. daily_report는 집계 카운터라 Int. 타입을 통일하려 하지 말 것(어느 쪽이든 손실). 매출 집계 정책(통화 변환·소수 처리)이 필요하면 그건 별도 설계 사안.
- **`postback`은 삽입 전용** — 이 앱은 postback을 `createMany`만 하고 조회하지 않는다. 그래서 조회 인덱스를 두지 않는다(과거 `@@index([token])`는 미사용이라 `20260710090000`에서 제거). postback을 token 등으로 조회하는 기능을 새로 넣는다면 그때 인덱스를 추가한다.

## 마이그레이션 규칙

- `migrations/`와 `migration_lock.toml`은 **버전 관리에 포함**한다. 손으로 편집하지 않는다.
- 이미 적용·커밋된 마이그레이션 SQL은 수정하지 않는다. 변경이 필요하면 새 마이그레이션을 만든다.
- 컬럼/테이블 **리네임**은 Prisma가 drop+create로 해석해 데이터가 날아갈 수 있다. 생성된 SQL을 열어 `RENAME`인지 확인하고, 아니면 SQL을 손봐서 데이터를 보존한다(예: `daily_statistic → daily_report` 리네임 마이그레이션 참고).
