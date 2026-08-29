# 레거시 MySQL(`mcpro`) → PostgreSQL(Prisma) 데이터 마이그레이션 계획

레거시 운영 DB(MySQL 8, 스키마 `mcpro`)의 데이터를 현재 프로젝트의 Prisma/PostgreSQL 스키마
(`apps/backend/prisma/schema.prisma`)로 옮기기 위한 계획서.

두 스키마는 같은 도메인의 다른 세대다. 마스터 데이터는 컬럼 리네임 수준으로 거의 1:1이지만
로그 계열은 테이블 구조 자체가 달라 변환이 필요하다.

> 이 문서의 모든 수치는 레거시 DB 실측값이다(`information_schema.TABLES.TABLE_ROWS` 추정치가 아님).

---

## 1. 범위

### 이관 대상

| # | 타깃 (Prisma) | 소스 (MySQL) | 원본 행 | 이관 후 |
|---|---|---|---:|---:|
| 1 | `advertiser` | `advertiser` | 48 | 48 |
| 2 | `tracker` | `tracker` | 10 | **5** |
| 3 | `media` | `media` | 28 | 28 |
| 4 | `advertising` | `advertising` | 179 | **155** |
| 5 | `campaign` | `campaign` | 1,404 | **1,338** |
| 6 | `campaign_config` | `postback_registered_event` | 4,659 | **4,393** |
| 7 | `daily_report` | `postback_daily` | 18,098,433 | ~18,098,420 (일자 집계로 추가 감소) |
| 8 | `postback` | `postback_install_*` + `postback_event_*` (5개 트래커) | 36,518,668 | **36,506,255** |

### 범위 밖 / 제외

| 대상 | 행 수 | 이유 |
|---|---:|---|
| `user` | 14 | 이번 범위 아님 |
| `user_log` | 867 | 이번 범위 아님 (타깃 테이블도 없음) |
| `reservation` | 4,134 | 이번 범위 아님 |
| `postback` (flat) | 32,394,067 | per-tracker 테이블과 **100% 중복** (§8) |
| `postback_unregistered_event` | 4,902 | 형상 불일치 + 2021-11-10에 데이터 끊김 (§9) |
| 미구현 트래커 5종 | tracker 5 · advertising 24 · campaign 66 · campaign_config 155 · daily_report 2 · 로그 12,413 | 레지스트리 미등록 (§3) |

### 타깃 컬럼이 없어 버려지는 것

`advertising.platform`(AOS/iOS) · `advertising.block` · `campaign.appkey` · `campaign.mecrossTrackingUrl` ·
`media.status` · `tracker.type` · `tracker.status` · per-tracker `send_url` ·
대부분 마스터 테이블의 `created_at` / `updated_at`

---

## 2. 결정 원장

| | 결정 |
|---|---|
| **A** `view_code` | 레거시 hex 폐기, `AES-128-CBC("token:pubId:subId")`로 **재인코딩**해서 저장 |
| **B** 타임존 | 일자는 KST 기준 — `DATE(CONVERT_TZ(created_at,'UTC','Asia/Seoul'))` |
| **C** flat `postback` | **제외** (per-tracker와 100% 중복) |
| **D** `postback_unregistered_event` | **제외** |
| **E** 미구현 트래커 5종 | **제외** (decotra / ive / mobiconnect / nswitch / tradingworks) |
| **F** `campaign_config.send_media` | 레거시 `status`와 동일 의미 → `send_media = (status = 1)`. 중복은 **최신 `idx` 채택** |
| **G** PK 타입 | `postback.id` · `daily_report.id` → **`BigInt`** |

---

## 3. `tracker` 리네임 — 놓치면 전 트래킹이 죽는다

`TrackingUseCase`는 `TRACKERS[snapshot.tracker_name]`으로 레지스트리를 조회하고
(`apps/backend/src/modules/tracking/application/tracking.use-case.ts:41`),
`campaign.tracker_name`은 `advertising.tracker.name`을 그대로 복사한다
(`apps/backend/src/modules/campaign/infrastructure/prisma-campaign.repository.ts:42`).
즉 **`tracker.name` 자체가 레지스트리 키**여야 한다.

| 레거시 `tracker.name` | 이관 값 | 광고 수 |
|---|---|---:|
| `adbrixremaster` | **`adbrix-remaster`** ← 변환 필수 | 25 |
| `appsflyer` | `appsflyer` | 49 |
| `adjust` | `adjust` | 34 |
| `airbridge` | `airbridge` | 32 |
| `singular` | `singular` | 15 |
| `decotra` / `ive` / `mobiconnect` / `nswitch` / `tradingworks` | **제외** | 24 |

변환을 빼먹으면 adbrix 광고 25건과 그 캠페인의 트래킹이 전부 404가 된다.
레거시 `originalUrl`의 경로가 이미 `.../adbrix-remaster/install?...`(하이픈)으로 정답을 갖고 있다.

레지스트리 정의: `apps/backend/src/trackers/tracker.registry.ts:33`

---

## 4. 스키마 선반영 (데이터 적재 **전**)

행이 비어 있을 때 하면 전부 공짜다. `apps/backend`에서
`pnpm migrate`(--create-only)로 생성 후 SQL 검토, `pnpm deploy`로 적용.

| 변경 | 근거 | 상태 |
|---|---|---|
| `postback.id` `Int` → `BigInt` | 결정 G | ✅ 적용 |
| `daily_report.id` `Int` → `BigInt` | 결정 G — 증가율상 `postback`보다 4배 빨리 참 | ✅ 적용 |
| `postback.view_code` · `daily_report.view_code` `VarChar(255)` → **`Text`** | 재인코딩 결과 최대 326자, `postback_daily`에 **856행** 초과 (§5-3). `pub_id`·`sub_id`를 255로 넓히면 view_code 최대가 818자가 되어 고정 폭으로는 다시 막힌다 | ✅ 적용 |
| `postback.pub_id` · `sub_id` (및 `daily_report` 동일) `VarChar(100)` → **`VarChar(255)`** | 레거시 최대 `pub_id` 19자 · `sub_id` 164자(`VarChar(100)` 초과 4,146행). 매체가 유저 단위 식별자를 실어 보내면 더 길어질 수 있어 둘 다 255로 맞춤 | ✅ 적용 |
| 그 외 컬럼 폭 | **per-tracker 실측 대기** (§13) | 미정 |

생성된 마이그레이션:

- `prisma/migrations/20260901000000_postback_daily_report_bigint_id/migration.sql`
- `prisma/migrations/20260901000001_widen_view_code_sub_id/migration.sql`

적용은 사용자가 직접 실행한다(`prisma/CLAUDE.md` 규칙): `pnpm --filter backend deploy`

### `BigInt` 전환의 코드 파급 — 리포지토리 한 줄

`postback.id`는 API 응답에 나가지 않는다. 로그 조회용 `LOG_SELECT`에 `id`가 없다
(`apps/backend/src/modules/postback/infrastructure/prisma-postback.repository.ts:7`).
유일한 사용처는 내부 경로 하나다:

```
create() -> Promise<number>                        (postback.repository.ts:22)
  -> postback-consumer.use-case.ts:62
  -> updateMediaSentAt(id, sentAt)                 (postback.repository.ts:23)
```

매체 전송 후 `media_sent_at`을 갱신하려고 방금 만든 행을 찾는 용도라 JSON 직렬화를 타지 않는다.
따라서 Prisma `BigInt`의 고질적 문제(`JSON.stringify`가 BigInt에서 throw)를 만나지 않는다.

**리포지토리 경계에서 `Number()`로 변환**하고 도메인·유스케이스 시그니처는 그대로 둔다:

```ts
const row = await this.prismaService.postback.create({ data: postback, select: { id: true } });
return Number(row.id);
```

선례가 이미 있다 — `apps/backend/src/modules/dashboard/infrastructure/prisma-dashboard.repository.ts:98-103`이
`$queryRaw`의 BigInt 카운터를 응답 전에 number로 변환하고 스펙까지 붙어 있다.
`Number`의 안전 정수 상한은 2^53이라 `bigserial` 실사용 범위에서 정밀도 손실이 없다.

`daily_report.id`도 API에 노출되지 않는다(`postback-consumer.use-case.ts`의 `upsertMany` 경로만 사용).

### 헤드룸 (참고)

| | 현재 증가율 | `Int`(21.4억) 소진까지 |
|---|---:|---:|
| `postback` | ~7.3M/년 (5년간 36.5M) | ~290년 |
| `daily_report` | ~21.9M/년 (302일간 18.1M) | ~98년 |

일 1억 클릭은 이미 현재 수치다(2026-08-20 하루 `sum(click)` = 100,884,989).
클릭은 `daily_report`의 **카운터**를 올릴 뿐 행을 늘리지 않아 행 증가는 인스톨·이벤트 건수에 비례한다.
따라서 이번 전환은 급한 불이 아니라 싼 보험이다.

---

## 5. `view_code` 재인코딩 (결정 A)

### 5-1. 함수

```
key = sha256("VIEW_CODE_SECRET").base64.slice(0, 16)
iv  = sha256("VIEW_CODE_SECRET").base64.slice(-16)
view_code = encodeURIComponent( base64( AES-128-CBC(`${token}:${pub_id}:${sub_id}`) ) )
```

구현: `apps/backend/src/common/utils/view-code.util.ts:8`

IV가 고정이라 **결정적**이다 — 같은 triple은 항상 같은 값이 나온다. 검증 완료:
`2a3429e4b13c45f7baad77515e5bd798:1184:10730`
→ `hUI5jhh963QZj1duCm5YieyTXqejPEVTDe8QPlmRH6qAlbNuqVgnnz7wjpYEWsIN` (64자)

**빈 문자열 주의.** `tracking.use-case.ts:35`는 `${query.pubId ?? ''}`라 평문에 빈 문자열이 들어가지만,
컬럼에는 `pubId || null`로 NULL이 저장된다(`install-postback.use-case.ts:16`).
재인코딩도 똑같이 **평문에는 `''`, 컬럼에는 NULL**로 맞춰야 신규 트래픽과 값이 일치한다.

`postback_daily` 기준: `pub_id` 빈 문자열 **216,785행**, `sub_id` 빈 문자열 **133,356행**.

### 5-2. 재인코딩하면 view_code가 병합된다

`postback_daily` 실측:

| | 값 |
|---|---:|
| distinct `view_code` (레거시 hex) | 15,146,789 |
| distinct `(token, pub_id, sub_id)` | 14,528,798 |
| **병합되는 수** | **617,991** |

같은 triple에 레거시 hex가 여러 번 발급된 케이스가 61.8만 건 있다.
재인코딩하면 하나로 합쳐져 **`daily_report @@unique([view_code, created_date])` 충돌**이 생긴다.
같은 날에 겹치는 것만 문제이며, **일자 단위 SUM 집계**로 해소된다(§7에서 어차피 필요).

### 5-3. 재인코딩 결과가 `VarChar(255)`를 넘었다 (해결됨)

재인코딩 결과 길이는 `pub_id`·`sub_id`에 딸려 늘어난다. 실측:

| `pub_id` / `sub_id` | 평문 | view_code 최대 |
|---|---:|---:|
| 없음 | 34 | 66 |
| 일반 (`1184` / `10730`) | 43 | 64 |
| 100 / 164 (레거시 최대) | 302 | 454 |
| **255 / 255 (확대 후 상한)** | 548 | **818** |

`pub_id` + `sub_id` 합계가 **125자를 넘으면** 옛 `VarChar(255)`를 초과한다 —
`postback_daily`에 **856건** 해당.

**이건 이관만의 문제가 아니라 신규 트래픽에도 해당되는 잠재 버그였다** —
긴 `sub_id`를 받으면 기존 코드도 저장에 실패한다(`tracking.use-case.ts:35`가 길이 제한 없이 암호화).

→ **`view_code`를 `Text`로 변경해 해결**(§4). 고정 폭을 두면 `pub_id`·`sub_id`를 넓힐 때마다
같은 버그가 재발하므로 상한을 두지 않았다. btree 인덱스 행 상한(~2704 bytes)에는 여유가 있다.

### 5-4. 컷오버 리스크

`view_code`는 클릭 시점에 매 요청 발급되어 트래커 URL에 치환돼 나간다(`tracking.use-case.ts:35`).
외부에 영구 배포되는 것은 **`token` 기반 mecross 트래킹 URL**이지 view_code가 아니다.
→ 컷오버 후 신규 클릭은 자동으로 새 체계를 쓴다.

남는 리스크는 하나: **컷오버 전 클릭 → 컷오버 후 도착하는 포스트백**(어트리뷰션 윈도우, 통상 7~30일).
이 포스트백은 레거시 hex를 물고 오는데, `decode()`가 실패 시 입력을 그대로 반환하므로
(`view-code.util.ts:23`) `token = hex 전체`가 되어 **조용히 유실된다**.

영향 경로:
- `apps/backend/src/modules/tracking/application/tracking-consumer.use-case.ts:16`
- `apps/backend/src/modules/postback/application/install-postback.use-case.ts:14`
- `apps/backend/src/modules/postback/application/event-postback.use-case.ts:14`
- `apps/backend/src/modules/postback/application/list-install-postbacks.use-case.ts:30`

**완화**: 레거시 hex → `(token, pub_id, sub_id)` 매핑 테이블을 윈도우 기간(30일 권장) 유지하고
`decode()`에 폴백을 넣는다. 매핑 소스는 `postback_daily`에 전부 있다.

---

## 6. 마스터 테이블 매핑

### `advertiser`
| MySQL | Prisma |
|---|---|
| `idx` | `id` |
| `name` varchar(255) | `name` VarChar(30) — 초과 0건 |
| `created_at` / `updated_at` | 버림 |

### `tracker` (5개만)
| MySQL | Prisma |
|---|---|
| `idx` | `id` |
| `name` | `name` — **`adbrixremaster` → `adbrix-remaster`** (§3) |
| `trackerTrackingUrlTemplate` | `tracking_url` |
| `mecrossPostbackInstallUrlTemplate` | `install_postback_url` |
| `mecrossPostbackEventUrlTemplate` | `event_postback_url` |
| `type`(전부 `tracker`) / `status` | 버림 |

NULL 0건 확인 — 3개 URL 컬럼 모두 NOT NULL 수용 가능.

### `media`
| MySQL | Prisma |
|---|---|
| `idx` | `id` |
| `name` | `name` (28행 전부 distinct, 30자 이내) |
| `mediaPostbackInstallUrlTemplate` | `install_postback_url` |
| `mediaPostbackEventUrlTemplate` | `event_postback_url` |
| `status` | 버림 |

### `advertising` (155개)
| MySQL | Prisma |
|---|---|
| `idx` | `id` |
| `name` | `name` — **중복 8건 처리 필요** (§10-1) |
| `image_url` | `image` |
| `advertiser` | `advertiser_id` |
| `tracker` | `tracker_id` |
| `platform`(AOS/iOS) / `status` / `block` | 버림 |

### `campaign` (1,338개)
| MySQL | Prisma |
|---|---|
| `idx` | `id` |
| `token` | `token` (전부 32~36자, `VarChar(36)` 수용) |
| `name` | `name` — 30자 초과 2건 |
| `type` (`CPI`/`CPA`) | `type` enum `Type` — 값 그대로 일치 |
| `status` / `block` | `is_active` |
| `trackerTrackingUrl` | `tracker_tracking_url` |
| — | `tracker_name` ← `advertising` → `tracker` 조인 (레지스트리 키로 변환) |
| `media` | `media_id` |
| `advertising` | `advertising_id` |
| `appkey` / `mecrossTrackingUrl` | 버림 |

---

## 7. `daily_report` ← `postback_daily`

18,098,433행 → 재인코딩 + KST 일자 집계.

| MySQL | Prisma |
|---|---|
| `idx` | `id` (`BigInt`) |
| — | `view_code` ← **재인코딩** (§5) |
| `token` | `token` (FK → `campaign.token`) |
| `pub_id` | `pub_id` — 빈 문자열 → NULL 정규화 |
| `sub_id` | `sub_id` — 빈 문자열 → NULL 정규화 |
| `click` `install` `registration` `retention` `purchase` `revenue` `etc1`~`etc5` `unregistered` | 동명 |
| `created_at` | `created_date` ← **`DATE(CONVERT_TZ(created_at,'UTC','Asia/Seoul'))`** |
| `updated_at` | 버림 |

### 반드시 지킬 것

1. **KST 일자** — `created_at`은 KST 자정에 생성된다(UTC 15:00:0x로 관측, 18,098,251/18,098,433행이 non-zero time).
   UTC로 `DATE()`를 자르면 **전 구간이 하루씩 밀린다.**
2. **일자 SUM 집계** — 레거시 unique는 `(view_code, created_at)` **초 단위**라 같은 날 중복 행이 존재하고,
   재인코딩 병합(§5-2)으로 충돌이 더 생긴다. `(재인코딩 view_code, KST 일자)`로 GROUP BY 하고
   카운터 13개를 전부 SUM 한다.
3. **제외 행** — `view_code IS NULL` 11행 / 미구현 트래커 캠페인 소속 2행 / `campaign`에 없는 고아 토큰 3개에 속한 행.

---

## 8. `postback` ← per-tracker 22개 중 10개 (5개 트래커)

**36,506,255행.** 트래커별 내역:

| 트래커 | install | event | 합계 |
|---|---:|---:|---:|
| airbridge | 2,997,027 | 25,088,397 | **28,085,424** (77%) |
| adbrix-remaster | 1,878,275 | 2,372,351 | 4,250,626 |
| singular | 328,150 | 2,093,779 | 2,421,929 |
| appsflyer | 384,936 | 807,401 | 1,192,337 |
| adjust | 197,120 | 358,819 | 555,939 |

### 8-1. 왜 flat `postback`이 아니라 per-tracker인가

레거시는 포스트백 하나를 두 군데에 쓴다 — per-tracker 테이블에 **원본 그대로**,
flat `postback`에 **공통 필드만 추린 요약본**.

행 단위 검증 (airbridge install, 2026-08-27, `click_id` 기준):

| | 행 수 |
|---|---:|
| per-tracker 행 (`click_id` 유효) | 1,043 |
| flat `postback`에서 매칭된 행 | **1,043** |
| per-tracker에만 있는 행 | **0** |

100% 중복이다. per-tracker 쪽이 정보량이 크고(`originalUrl` · `pub_id` · `sub_id` 보유)
기간도 넓다(2021-06~ vs 2022-07~). flat은 오히려 `click_id` NULL 98,374행 ·
`ip` NULL 99,678행 · `event_name` NULL 18,688행에 길이 제약 위반까지 있다.

> 참고: `click_id`는 **빈 문자열이 섞여 있어 단독 조인 키로 쓸 수 없다.**
> 검증 중 빈 문자열 2행이 flat 쪽 빈 문자열 ~178만 건과 매칭돼 조인이 357만 행으로 폭발했다.

### 8-2. 트래커별 컬럼 매핑

매핑의 정답지는 `apps/backend/src/trackers/<트래커>/{install,event}.mapper.ts`다.
레거시 per-tracker 테이블은 그 원본 파라미터를 컬럼으로 펼쳐 놓은 것이라 매퍼를 그대로 따라가면 된다.

| 새 컬럼 | appsflyer | airbridge | adjust | adbrix-remaster | singular |
|---|---|---|---|---|---|
| `click_id` | `clickid` | `click_id` | `click_id` | `cb_3` | `sub3` |
| `token` | `af_c_id` | `token` ※ | `cp_token` | `cb_1` | `sub1` |
| `adid` | `advertising_id` | `google_aid` | `adid` / `gps_adid` | `adid` | `gaid` |
| `idfa` | `idfa` / `idfv` | `ios_idfa` / `ios_ifv` | `idfa` / `idfv` | `idfv` | `idfa` / `idfv` |
| `ip` | `device_ip` | `device_ip` | `ip_address` | `a_ip` | `attribution_ip` |
| `country_code` | `country_code` | `country` | `country` | `device_country` | `attribution_country` |
| `clicked_at` | `click_time` (install만) | `click_timestamp` | `click_time` | `a_server_datetime` (install만) | `click_utc` |
| `installed_at` | `install_time` | `install_timestamp` | `installed_at` | `event_datetime` / `attr_event_datetime` | `utc` (install) / **없음** (event) |
| `evented_at` | `event_time` | `event_timestamp` | **`created_at2`** | `event_datetime` | `utc` |
| `event_name` | `event_name` | `eventName` | `event_type` | `event_name` | `event_name` |
| `revenue_currency` | `event_revenue_currency` | `product_info` | `currency` | `currency` | `currency` |
| `revenue` | `event_revenue` | `eventValue` | `revenue` | `revenue` | `amount` |

※ airbridge는 매퍼상 `custom_param1`/`sub_id`지만 레거시 테이블이 해석된 `token`/`view_code` 컬럼을
따로 갖고 있다(원본 `sub_id`는 `sub_id2`로 리네임). 해석된 컬럼을 쓴다.

**전 테이블 공통 보유**: `token` · `view_code` · `pub_id` · `sub_id` · `originalUrl` · `send_time` · `send_url` · `created_at`

| 새 컬럼 | 소스 |
|---|---|
| `pub_id` / `sub_id` | 동명 컬럼 (빈 문자열 → NULL 정규화) |
| `media_sent_at` | `send_time` |
| `created_at` | `created_at` |
| `view_code` | **재인코딩** (§5) — 소스 컬럼을 쓰지 않는다 |
| `tracker_name` | 레지스트리 키 리터럴 (`originalUrl` 경로와 일치) |
| `raw_query_params` | `originalUrl`의 쿼리스트링을 **JSON 객체로 변환** (§8-3) |

### 8-3. 함정 4개

1. **adjust event의 `evented_at`** — 매퍼는 `created_at`을 읽지만 레거시 테이블에서 그 인바운드
   파라미터는 **`created_at2`**로 리네임돼 있다(`created_at`은 행 삽입 시각).
   잘못 쓰면 358,819행의 이벤트 시각이 전부 틀린다.
2. **singular event의 `installed_at`** — 매퍼는 `install_utc`를 읽는데 `postback_event_singular`에
   그 컬럼이 없다(`time` / `utc` / `click_time` / `click_utc`뿐). **2,093,779행 NULL**
   (nullable이라 이관 자체는 통과).
3. **`raw_query_params` 포맷** — 새 코드는 `JSON.stringify(query)`, 즉 **쿼리 파라미터의 JSON 객체**를
   저장한다(`install-postback.use-case.ts:16`). 레거시 `originalUrl`은
   `http://app/airbridge/install?click_id=...` 형태의 **풀 URL 문자열**이다.
   쿼리스트링을 파싱해 JSON으로 변환해야 신규 행과 포맷이 일치한다.
4. **`event_name`** — install 테이블은 리터럴 `'install'`을 넣는다
   (`install-postback.use-case.ts:16`, `campaign_config.tracker_event_name` 기본값과 일치).

---

## 9. `campaign_config` ← `postback_registered_event`

4,659행 → 제외 175행(미구현 트래커 155 + 고아 토큰 20) → 4,484행 → 중복 91행 제거 → **4,393행**

| MySQL | Prisma |
|---|---|
| `idx` | `id` |
| `token` | `campaign_id` (조인) |
| `tracker` | `tracker_event_name` — 39자 초과분 처리 필요 |
| `admin` | `admin_event_name` (최대 12자) |
| `media` | `media_event_name` — 39자 초과분 처리 필요 |
| `status` | `send_media = (status = 1)` |
| `created_at` / `updated_at` | 버림 |

`status` 분포 (범위 내): `1` → 3,637행 (`send_media = true`) / `0` → **847행** (`false`) / NULL 0건.
스키마 기본값이 `true`라 847행만 명시적으로 `false`를 넣으면 된다.

### 중복 정리 (결정 F)

`@@unique([campaign_id, admin_event_name])` 위반: **73개 그룹 / 91행**.
그중 **1개 그룹만 `status` 값이 충돌**한다(한쪽 0, 한쪽 1). 나머지 72개는 값이 같아 아무거나 남겨도 동일.

```sql
ROW_NUMBER() OVER (PARTITION BY token, admin ORDER BY idx DESC) = 1
```

최신 `idx` 채택으로 통일한다.

### 버려지는 `postback_unregistered_event` (결정 D)

`(token, event_name, event_count, created_at, updated_at)` 구조로 **클릭 단위가 아니라
(토큰, 이벤트명, 일자)별 일일 카운터**다. `view_code` · `click_id` · `ip` · `raw_query_params`가
전부 없는데 새 `postback`에서 모두 NOT NULL이다.

실측: 4,902행 / `event_count` 합계 17,044 / 토큰 44개 / 이벤트명 13개 /
데이터가 **2021-07-14 ~ 2021-11-10에서 끊김**.

새 스키마에는 이미 `daily_report.unregistered` 카운터가 있고 레거시 `postback_daily.unregistered`도
있어서, `postback`에 넣으면 **이중 계상**된다. 제외한다.

---

## 10. 제약 위반 목록

| # | 위반 | 실측 | 처리 |
|---|---|---:|---|
| 1 | `advertising.name @unique` | **8건 중복** | 이름 뒤에 구분자 부여 또는 병합 |
| 2 | `campaign.name VarChar(30)` | 2건 초과 | 절단 |
| 3 | `campaign_config.*_event_name VarChar(30)` | **337건 초과** (최대 39자) | 절단 또는 컬럼 확대 |
| 4 | `campaign_config @@unique` | 73그룹 / **91행** | 최신 `idx` 채택 (§9) |
| 5 | `campaign_config` 고아 토큰 | **20건** | 제외 |
| 6 | `daily_report.token` FK | 고아 토큰 **3개** | 해당 행 제외 (행 수 미측정) |
| 7 | `daily_report @@unique([view_code, created_date])` | 초 단위 중복 + 재인코딩 병합 61.8만 | 일자 SUM 집계 (§7) |
| 8 | `pub_id`·`sub_id` `VarChar(100)` | `sub_id` **4,146행** 초과 (최대 164자) | ✅ 둘 다 `VarChar(255)`로 확대 (§4) |
| 9 | `view_code VarChar(255)` | **856행** 초과 (재인코딩 후) | ✅ `Text`로 확대 (§4) |
| 10 | per-tracker 컬럼 폭 | **미측정** (§13) | 미정 |

### 1번 상세 — `advertising.name` 중복 8건

`골드스푼 (AOS)` · `올라케어 (AOS)` · `올라케어 (iOS)` · `플레이오 (AOS)` ·
`NS홈쇼핑 (AOS)` · `웰컴저축은행 (AOS)` · `사람인 (AOS)` · `벼룩시장_회원가입 (AOS)` — 각 2행

---

## 11. 실행 순서

1. ✅ **스키마 선반영** (§4) — `BigInt` 전환 + `view_code`/`pub_id`/`sub_id` 확대. 마이그레이션 2개 작성 완료,
   **적용은 아직**: `pnpm --filter backend deploy`. (§13의 per-tracker 실측 결과에 따라 컬럼이 더 붙을 수 있다)
2. **사전 점검** (§10, §13) — 제약 위반 실측 재확인, `daily_report` 고아 토큰 3개의 행 수 측정.
3. **마스터** (1,574행) — 순서 고정:
   `advertiser` → `tracker`(5개, **리네임**) → `media` → `advertising`(155) → `campaign`(1,338).
   레거시 `idx` → 새 `id` 매핑 테이블 유지.
4. **`campaign_config`** (4,393행) — 제외·중복 정리 후.
5. **`daily_report`** (18.1M) — KST 일자로 자르고 재인코딩 view_code 기준 SUM 집계,
   `pub_id`/`sub_id` 빈 문자열 → NULL.
6. **`postback`** (36.5M) — 트래커별 10개 테이블을 매퍼 규칙대로 정규화 삽입.
   airbridge 하나가 77%이므로 별도 청크 처리.
7. **레거시 view_code 매핑 테이블** 30일 유지 + `decode()` 폴백 (§5-4).
8. **검증** (§12).

---

## 12. 검증

- 일자별 카운터 합계 대조 — 레거시 `postback_daily`(KST 일자 집계) vs 새 `daily_report`
- 캠페인별 `postback` 건수 대조 — 트래커별 install/event 각각
- 재인코딩 왕복 검증 — 새 `daily_report.view_code`를 `viewCodeCodec.decode()`로 풀어
  `token:pub_id:sub_id`가 원본과 일치하는지 샘플 확인
- `campaign.tracker_name`이 전부 `TRACKER_NAMES`에 있는지 확인 (§3 리네임 검증)
- FK 무결성 — `daily_report.token` → `campaign.token`, `campaign_config.campaign_id` → `campaign.id`

---

## 13. 미해결

### per-tracker 컬럼 길이 실측 (미측정)

per-tracker 10개 테이블(36.5M)에서 아래 컬럼의 최대 길이와 `token` NULL·빈값 수를 재야 한다.
결과가 §4의 "그 외 컬럼 폭"과 §10-10을 확정한다.

| 새 컬럼 | 제약 | 상태 |
|---|---|---|
| `click_id` | `VarChar(100)` | 미측정 |
| `ip` | `VarChar(30)` | 미측정 |
| `country_code` | `VarChar(10)` | 미측정 |
| `event_name` | `VarChar(100)` | 미측정 |
| `revenue_currency` | `VarChar(10)` | 미측정 |
| `revenue` | `VarChar(50)` | 미측정 (숫자 문자열이라 위험 낮음) |
| `adid` · `idfa` | `VarChar(50)` | 미측정 (flat 관측 최대 36자로 여유) |
| `token` | `VarChar(100)` | 미측정 (NULL·빈값 수 포함) |
| `pub_id` · `sub_id` | ✅ `VarChar(255)`로 확대 완료 | — |

> 참고: flat `postback`(제외 대상) 기준으로는 `ip` 169자 · `click_id` 255자 · `country` 21자 ·
> `currency` 24자로 전부 제약을 넘겼다. 다만 이는 flat 전용 문제일 수 있어 per-tracker 기준 재측정이 필요하다.

전체 스캔이라 10~30분 걸리며, 한 번에 10개 테이블을 돌리면 MCP idle 타임아웃(30분)에 걸린다.
트래커별로 쪼개서 순차 실행할 것 — airbridge event(25.1M)가 단독으로 가장 무겁다.

### 남은 확인

- `daily_report` 고아 토큰 3개에 속한 행 수 (미측정)
- `campaign_config` 중복 중 `status`가 충돌하는 1개 그룹 — 최신 `idx` 채택으로 자동 해소되나 눈으로 확인 권장
