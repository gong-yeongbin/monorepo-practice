# prisma

`schema.prisma`(단일 스키마)와 `migrations/`(적용 이력). PostgreSQL 대상이며 domain·repository는 이 스키마에서 파생된 Prisma 생성 타입을 그대로 쓴다(`modules/CLAUDE.md`의 도메인 타입 규칙 참고).

## 명령어 (`apps/backend`에서 실행)

- `pnpm migrate` — `prisma migrate dev --create-only`. **SQL만 생성하고 적용은 하지 않는다.** 생성된 migration.sql을 검토한 뒤 `pnpm deploy`로 적용한다.
- `pnpm deploy` — `prisma migrate deploy`. 미적용 마이그레이션을 순서대로 적용.
- `pnpm generate` — Prisma Client 재생성. **스키마를 바꾸면 반드시 실행**해야 타입이 맞는다(빌드/타입체크 전 필수).
- `pnpm reset` — DB 초기화. **데이터가 삭제되므로** 로컬에서만. 초기화 후 seed가 자동 실행된다.
- `pnpm seed` — `seed.ts` 실행(로컬 테스트 데이터 생성). upsert 기반이라 재실행해도 안전. 역할별 유저 4개(`admin`=DEVELOPER·`ops`=ADMIN·`viewer`=USER는 `approved: true`, `pending`=USER는 승인 대기. 전부 `@test.com` / `test1234!`)와 advertiser→tracker→media→advertising→campaign→campaign_config 그래프, daily_report 7일치, 포스트백 로그 모달용 postback 7일치(인스톨·가입·구매는 daily_report 건수와 일치, 미등록 이벤트 1건/일, `click_id`가 `seed_click_` 접두사)를 만든다.

`seed.ts` 상단의 `TRACKER_SEEDS`는 트래커 4곳의 실제 트래킹 링크·포스트백 URL 템플릿이다. 이름은 `TRACKERS` 레지스트리 키와 같아야 하고(레거시 `adbrixremaster` → `adbrix-remaster`), adjust만 트래킹 링크에서 콜백을 뺐다 — 클릭 치환기가 모르는 `{macro}`를 빈 문자열로 지워 콜백 안의 adjust 매크로까지 날아가기 때문이다.

`postback-samples.ts`는 트래커 4곳이 실제로 보내오는 원본 쿼리(파라미터 40여 개, 중복 키, 미치환 매크로)를 보존한 install·event 8건이다. 앱 식별자는 이 프로젝트 값으로, 단말 광고 ID와 IP는 더미·문서용 주소(RFC 5737)로 치환했다. 파생 컬럼은 손으로 적지 않고 `TRACKERS` 매퍼 → `createPostback`을 태워 만들므로 매퍼가 바뀌면 시드도 따라간다. 이 8건만 `sub_id`가 `seed_sub_raw`라 view_code가 갈리고, 대응하는 daily_report 한 줄(install 4·미등록 4)을 따로 만든다. **seed.ts가 `src`의 매퍼를 import하므로 실행 커맨드에 `-r tsconfig-paths/register`가 필요하다**(`prisma.config.ts`).

**이 Prisma 명령어(`migrate`/`deploy`/`generate`/`reset`/`seed`)는 에이전트가 직접 실행하지 않고 사용자가 직접 실행한다.** 실제 DB에 연결·변경을 가하고 `.env`의 `DATABASE_URL`에 의존하기 때문이다. 에이전트는 `schema.prisma` 수정과 마이그레이션 `migration.sql`을 손으로 작성하는 데까지만 하고, 적용(`deploy` 등)은 사용자에게 명령어를 안내한다. 사용자가 세션에서 직접 돌리려면 `!` 접두사로 실행하면 된다(예: `! pnpm deploy`).

## datasource url은 schema가 아니라 config/service에서 주입 (주의)

`datasource db`에는 `provider = "postgresql"`만 있고 **`url`이 없다.** Prisma 7에선 schema에 url을 둘 수 없다. 여기에 `url = env("DATABASE_URL")`을 추가하지 말 것. url은 두 경로로 주입된다.

- **마이그레이션·CLI**(`migrate`/`deploy`/`reset`/`generate`): `prisma.config.ts`가 `process.env.DATABASE_URL`을 주입한다. `.env`에 `DATABASE_URL`이 있어야 동작한다.
- **런타임 앱 연결**: `PrismaService`가 driver adapter `PrismaPg({ connectionString: process.env.DATABASE_URL })`로 직접 만든다(`src/infra/prisma/prisma.service.ts`).

## 스키마 규칙 (기존 컨벤션 유지)

- 모델명·컬럼명은 **snake_case**(예: `daily_report`, `tracker_name`, `created_date`). domain 타입이 이 이름을 그대로 쓰므로 어긴 뒤 매핑을 손으로 맞추지 말 것.
- 컬럼 타입은 `@db.VarChar(n)`, `@db.Text`, `@db.Date`, `@db.Timestamp(0)` 등으로 **명시**한다.
- enum은 파일 하단에 모아 둔다(`Role`, `Type`). enum 값은 대문자.
- 집계 카운터(`daily_report`의 click/install/…)는 `Int @default(0)`. upsert의 `increment`로 누산한다(`prisma-daily-report.repository.ts`).
- 복합 unique는 `@@unique([...])`. 예: `daily_report`의 `[view_code, created_date]`(일자별 유일), `campaign_config`의 `[campaign_id, admin_event_name]`.
- M:N 조인 테이블은 **명시적 모델 + 복합 PK**(`@@id([a_id, b_id])`)로 만든다. 예: `user_advertising`. Prisma 암묵적 M:N(`@relation`만 선언)은 테이블·컬럼명을 Prisma가 정해 이 저장소의 snake_case 규칙과 어긋난다. 복합 PK는 선두 컬럼만 인덱스를 커버하므로 반대편 FK에는 `@@index`를 따로 붙인다.

## 의도적 설계 (결함처럼 보이지만 그대로 둘 것)

- **`daily_report`의 관계가 `campaign_id`가 아니라 `token`으로 연결됨** — tracking consumer는 클릭 집계 시 campaign을 조회하지 않고 viewCode에서 디코드한 token만으로 upsert한다. FK를 campaign_id로 바꾸면 트래킹 핫패스에 DB 조회가 강제되어 성능이 나빠진다. `campaign.token`은 uuid 기본값이라 잘 바뀌지 않는다.
- **`postback.revenue`는 `String`, `daily_report.revenue`는 `Int`** — postback은 트래커 원본 매출(소수·통화 혼재 가능)을 손실 없이 보존한다. daily_report는 집계 카운터라 Int. 타입을 통일하려 하지 말 것(어느 쪽이든 손실). 매출 집계 정책(통화 변환·소수 처리)이 필요하면 그건 별도 설계 사안.
- **`postback`은 삽입 위주** — 트래킹 파이프라인은 `createMany`만 한다. 어드민 로그 조회 API(`/postbacks/install·event·unregistered`)가 추가되면서 조회 인덱스 3개(`[token, installed_at]`, `[token, evented_at]`, `[view_code]`)를 뒀다(`20260815100000`).
- **`daily_report`의 인덱스가 unique 하나로 부족했다** — `@@unique([view_code, created_date])`는 선두가 `view_code`라 `created_date`·`token`으로 들어오는 조회 4개(dashboard·daily·dailyDetail·detail)를 커버하지 못한다. `@@index([created_date])`와 `@@index([token, created_date])`를 따로 둔 이유다(`20260830000000`). `token`은 FK지만 PostgreSQL이 FK 인덱스를 자동 생성하지 않는다.
- 두 테이블 모두 데이터가 크게 쌓이면 보존 기간 정책·날짜 파티셔닝은 별도 설계 사안.

## 마이그레이션 규칙

- `migrations/`와 `migration_lock.toml`은 **버전 관리에 포함**한다. 손으로 편집하지 않는다.
- 이미 적용·커밋된 마이그레이션 SQL은 수정하지 않는다. 변경이 필요하면 새 마이그레이션을 만든다.
- 컬럼/테이블 **리네임**은 Prisma가 drop+create로 해석해 데이터가 날아갈 수 있다. 생성된 SQL을 열어 `RENAME`인지 확인하고, 아니면 SQL을 손봐서 데이터를 보존한다(예: `daily_statistic → daily_report` 리네임 마이그레이션 참고).
