# 이관 맥락 메모

작업 중 내린 결정과 이유를 계속 덧붙인다. 다음 세션이 추론을 반복하지 않게 하기 위함.

## 2026-07-10 초기 조사

### admin-backend API 전수 (프론트 제공)
- 인증/유저: `POST /login`(LocalAuthGuard), `POST /user`, `GET /profile`(JWT decode)
- advertiser: `GET /advertiser`, `PUT /advertiser`(생성, 주석상 원래 POST 의도)
- advertising: `PUT`/`GET`/`PATCH :idx` + `dashboard`/`daily`/`dailydetail`/`list`/`:idx`/`detail/:idx`/`campaign/:idx`/`dailydetail/excel`
- campaign: `PUT`/`DELETE :idx`/`PATCH :idx`/`GET :idx`/`:idx/event`(GET·PATCH)/`:idx/block`(PATCH)
- media: `GET /media`
- partner: `GET /partner/:idx` (?type=media 분기)
- tracker: `GET /tracker` (인증 없음)
- reservation: `PUT`/`DELETE :idx`/`GET off/:idx`/`GET on/:idx`
- image-upload: `POST /fileupload/:idx` (S3, multer)
- postback: `GET install|event|unregistered/:tracker` (+ install|event `/excel`). 트래커 9종: adbrixremaster, appsflyer, adjust, singular, airbridge, tradingworks, mobiconnect, ive, nswitch

### monorepo 현황
- 구현 모듈 2개뿐: `tracking`, `postback`(둘 다 트래킹 파이프라인, 어드민 CRUD 아님).
- 컨트롤러 2개: tracking(`GET /tracking` 리다이렉트), postback.
- **인증 전무**(Passport/JWT/가드/인터셉터 없음).
- Prisma 모델 9개: user, advertiser, tracker, advertising, campaign, media, campaign_config, postback, daily_report.
  - **없는 모델: reservation, partner** → 해당 도메인 이관 시 스키마 추가 필요.

### 4계층 패턴(monorepo가 이미 따르는 규약, modules/CLAUDE.md)
- domain: `*.entity.ts`는 **interface**(class 아님), 필드는 **snake_case**(DB 컬럼과 동일). repository 인터페이스 + `Symbol()` 토큰.
- application: `*.use-case.ts`. repository 인터페이스만 주입(PrismaService 직접 주입 금지).
- infrastructure: `prisma-*.repository.ts`가 domain 인터페이스 implements. Prisma는 여기에만 갇힘.
- presentation: `*.controller.ts` / `*.consumer.ts`. DTO는 presentation/dto 또는 application/dto.
- 모듈에서 `{ provide: XXX_REPOSITORY, useClass: PrismaXxxRepository }`로 바인딩.
- 별칭: tsconfig paths에 모듈별로 등록(`@tracking/*` 등). 새 모듈이면 별칭 추가.
- 테스트: 소스와 같은 폴더에 `*.spec.ts` 나란히. `*.module.ts`는 커버리지 제외.

### 인증 원본 구현(admin-backend)
- AuthService.validateUser: userService.getUser(id) → bcrypt.compare → password 제거 후 반환.
- AuthService.login: payload `{ id, sub: user.type }` → jwtService.sign. `{ accessToken }` 반환.
- LocalStrategy: `usernameField: 'id'`.
- JwtStrategy: Bearer 토큰, `secretOrKey: process.env.JWT_SECRET`, validate → `{ id }`. (원본에 `ignoreExpriration` 오타 있음 — 이관 시 `ignoreExpiration`으로 교정)
- TokenInterceptor: authorization 헤더 없거나 'undefined'면 401. (실제 서명 검증은 안 함 — JwtStrategy가 별도로 함. 이관 시 JwtAuthGuard로 대체 검토)
- ResponseInterceptor: `{ statusCode, data, _meta }`로 래핑. _meta는 body+query 필드 복사.

## 결정 로그

### D1 (2026-07-10 최종): user 비밀번호 = bcrypt로 통일
- **재개정 경위**: "기존 salt 방식 유지"로 확정했으나 1단계 착수 시 확인 결과 **monorepo에 salt를 쓰는 해싱 구현이 전무**했다(Prisma에 `salt` 컬럼 선언만 존재, 사용 코드 0). 게다가 `password VarChar(20)`은 어떤 표준 해시도 담지 못한다. "유지할 기존 구현"이 없어 어느 방식이든 마이그레이션이 불가피 → bcrypt 통일로 최종 결정.
- **스키마 변경**: `user` 모델에서 `salt` 컬럼 **제거**, `password` `VarChar(20)` → `VarChar(60)`(bcrypt 해시 길이).
- **해싱**: bcrypt (admin-backend 원본과 동일, `bcrypt.hash(pw, 10)` / `bcrypt.compare`).
- **마이그레이션**: 에이전트가 schema.prisma 수정 + migration.sql 작성까지. 적용(`pnpm deploy`)은 사용자가 직접(`prisma/CLAUDE.md`).
- JWT payload는 `role` 기반으로 설계(admin의 type/typeIdx는 버림. monorepo user엔 `user_id`+`role`만 있음).
- ⚠️ admin 원본 로그인은 `usernameField: 'id'`지만 monorepo는 식별자가 `user_id`다. LocalStrategy usernameField를 `user_id`로 맞춘다.

### D2 (2026-07-10 확정): ResponseInterceptor = 어드민 API에만
- 새 어드민 컨트롤러에만 `@UseInterceptors(ResponseInterceptor)` 적용.
- 기존 트래킹/포스트백 파이프라인은 **불변**(외과적 변경).
- 전역 등록(main.ts) 안 함.
- 위치: `src/interceptors/response.interceptor.ts`(common은 무상태 함수 전용 규약이라 인터셉터 불가). 별칭 `@interceptors/*`.

## 1단계 인증 인프라 — 완료(2026-07-10, e2e만 사용자 검증 대기)

### 구조 결정
- **profile 엔드포인트를 user가 아니라 auth 컨트롤러에 뒀다.** 최초엔 user.controller에 `GET /profile`을 뒀으나, JwtAuthGuard(=JwtStrategy)가 auth 모듈에 있어 `UserModule ↔ AuthModule` 순환이 생겼다. profile은 "인증된 사용자 정보 조회"라 auth 도메인에 두는 게 자연스럽고, 이로써 의존이 `AuthModule → UserModule` 단방향이 됐다. UserModule은 `GetProfileUseCase`·`FindUserUseCase`를 export.
- **POST /user는 인증 없이 개방.** JwtAuthGuard를 붙이면 최초 관리자 계정 생성 불가(순환). admin 원본도 인증 없이 열려 있었으므로 원본 동작 유지 + 주석으로 명시. 접근 제어는 별도 설계 사안.
- **admin의 TokenInterceptor는 이관하지 않고 JwtAuthGuard로 대체**(사용자 확정). 원본은 헤더 존재만 보고 서명 미검증이라 허술.
- JWT payload = `{ user_id, role }`. LocalStrategy `usernameField: 'user_id'`. JwtStrategy는 `ignoreExpiration: false`(원본 오타 `ignoreExpriration` 교정).

### 파일 배치(4계층)
- user: domain(user.entity·user.repository) / infrastructure(prisma-user.repository) / application(create-user·get-profile·find-user use-case + create-user.dto) / presentation(user.controller) / user.module
- auth: application(validate-user·login use-case) / infrastructure(local.strategy·jwt.strategy) / presentation(auth.controller·local-auth.guard·jwt-auth.guard) / auth.module
- 공유: interceptors/response.interceptor

### 스키마·마이그레이션
- schema.prisma: user에서 salt 제거, password VarChar(20)→VarChar(60).
- migration: `20260710120000_alter_user_bcrypt/migration.sql`(DROP salt, MODIFY password). **아직 미적용 — 사용자가 `pnpm deploy` 실행 필요**.
- Prisma generate 주의: `pnpm --filter backend generate`는 실행 위치 문제로 스키마를 못 읽을 수 있다. `pnpm generate`(pnpm이 backend 워크스페이스에서 실행)로 돌리면 정상. salt 제거가 반영 안 되면 이걸 의심.

### 테스트 규약 준수
- 신규 spec 23개. user·auth·interceptors 4지표 **100%**.
- jest 30이라 CLI 옵션은 `--testPathPatterns`(복수형). `bcrypt`는 native라 `jest.spyOn` 불가 → `jest.mock('bcrypt')` + `as jest.Mocked<typeof bcrypt>` 사용.
- **package.json jest `moduleNameMapper`에도 새 별칭(@user·@auth·@interceptors)을 추가해야** spec import가 해석된다(tsconfig만으론 부족). 다음 도메인 이관 시에도 별칭 추가하면 두 곳(tsconfig + jest) 모두 갱신할 것.
- turbo.json `globalEnv`에 JWT_SECRET 추가(안 하면 lint 경고).

### 의존성 추가
- 런타임: @nestjs/passport @nestjs/jwt passport passport-local passport-jwt bcrypt
- 타입: @types/passport-local @types/passport-jwt @types/bcrypt

## 2단계 advertiser — 완료(2026-07-10, e2e만 사용자 검증 대기)

- 가장 단순한 도메인. 모델(`advertiser`: id, name unique 30자)은 monorepo에 이미 존재 → **스키마 변경 없음**.
- 엔드포인트: `GET /advertiser`(목록), `POST /advertiser`(생성, 이름 중복 시 ConflictException).
  - admin 원본은 `@Put()` + `@Query()`였고 컨트롤러 주석에 `//Put -> Post` 의도가 있었다. REST 표준대로 **POST + @Body**로 정리(1단계에서 원본보다 나은 표준 택한 것과 일관).
- 인증: 컨트롤러 레벨 `@UseGuards(JwtAuthGuard)` + `@UseInterceptors(ResponseInterceptor)`. admin은 TokenInterceptor였으나 JwtAuthGuard로 대체(1단계 방침).
- 모듈: `AdvertiserModule`이 `AuthModule`을 import(JwtAuthGuard의 'jwt' 전략 보장). repository 바인딩 `{ provide: ADVERTISER_REPOSITORY, useClass: PrismaAdvertiserRepository }`.
- 별칭 `@advertiser/*` — tsconfig + package.json jest moduleNameMapper 양쪽에 추가.
- 테스트 9개, advertiser 전 계층 4지표 100%.

### 도메인 이관 반복 패턴(다음 도메인부터 이걸 그대로 따름)
1. 별칭 추가(tsconfig paths + jest moduleNameMapper 양쪽).
2. domain(entity interface + repository 인터페이스+Symbol 토큰) → infrastructure(prisma-*.repository) → application(use-case + dto) → presentation(controller, JwtAuthGuard+ResponseInterceptor).
3. `*.module.ts`에서 repository useClass 바인딩 + AuthModule import, app.module 등록.
4. 계층별 spec 작성(repository/use-case/controller), `pnpm build` + `test:cov`로 4지표 100% 확인.
5. entity가 interface뿐이면 실행 코드 0이라 커버리지 표에 안 뜨는 게 정상.

## 3단계 media — 완료(2026-07-10, e2e만 사용자 검증 대기)

- 엔드포인트: `GET /media`(JwtAuthGuard + ResponseInterceptor).
- **admin 원본의 미묘한 동작을 이관**: `mediaRepository.createQueryBuilder(...).loadRelationCountAndMap('media.campaign', 'media.campaign')`은 응답의 `campaign` 필드를 **관계 배열이 아니라 연결된 캠페인 개수(number)**로 덮어쓴다. 이를 Prisma `include: { _count: { select: { campaign: true } } }`로 세고, repository에서 `{ ...media 필드, campaign: row._count.campaign }` 형태로 매핑해 재현.
- 그래서 domain 타입은 `MediaWithCampaignCount`(campaign: number). 스키마 변경 없음(media 모델 이미 존재).
- 매핑 로직이 repository에 있으므로 repository spec에서 `_count.campaign` → `campaign` 변환을 명시 검증.
- 테스트 4개, media 전 계층 4지표 100%.

## 4단계 tracker — 완료(2026-07-10, e2e만 사용자 검증 대기)

- **조율 판단**: admin `getTrackerList()`는 DB `tracker` 테이블 `find()`다(순수 데이터 조회). monorepo의 기존 `src/trackers/`(레지스트리)는 **DB가 아니라 코드 레벨 매핑 로직**(트래킹 URL 치환·포스트백 파싱)이라 완전히 다른 관심사. 섞으면 트래킹 파이프라인을 건드리는 셈 → **DB tracker 모델로만 이관, `trackers/`는 불변**.
- 엔드포인트: `GET /tracker`. 모델(id, name, tracking_url, install_postback_url, event_postback_url) 이미 존재 → 스키마 변경 없음.
- **인증·ResponseInterceptor 둘 다 없음**: admin 원본 tracker 컨트롤러엔 TokenInterceptor·ResponseInterceptor가 없었다(다른 어드민 컨트롤러엔 다 있음). 실수일 가능성이 있으나 추측 않고 원본 동작 유지. 컨트롤러 주석 + 이 메모에 불일치 명시. 향후 정책 통일 필요하면 별도 판단.
- 별칭: 새 모듈은 단수 `@tracker/*`, 기존 레지스트리는 복수 `@trackers/*`. 정규식 경계상 충돌 없음(`^@tracker/(.*)$`는 `@trackers/x` 미매칭). 이름이 비슷하니 헷갈리지 말 것.
- 테스트 3개, tracker 전 계층 4지표 100%.

## 5단계 campaign — 진행 중(2026-07-10)

### 스키마 결정: monorepo 기준(사용자 확정)
- admin `Campaign`과 monorepo `campaign`은 필드가 크게 다르다: admin의 `appkey`, `mecrossTrackingUrl`, `block`, `status`가 monorepo엔 없거나 이름 다름(`status→is_active`, `idx→id`). admin은 `PostbackRegisteredEvent` 테이블에 의존하나 monorepo엔 없고 `campaign_config`가 있다.
- **monorepo 스키마 기준으로 재해석**. 없는 필드는 꼭 필요한 것만 추가하기로 했으나, block/특수URL을 빼기로 해서 **결과적으로 스키마 변경 0**.

### 결정(사용자 확정)
- **block 제외**: admin `PATCH /:id/block`(block 토글 + Redis del)은 이관 안 함. campaign에 block 컬럼 없음 유지.
- **특수 URL 분기 제외**: admin `putCampaign`의 매체·트래커별 하드코딩 분기(nativex/nstation/ive/decotra/nswitch)를 옮기지 않음. 표준 `tracker_tracking_url`만 사용.
- appkey/mecrossTrackingUrl도 monorepo 스키마에 없으므로 자연히 제외.

### 엔드포인트 매핑(admin → monorepo)
- `POST /campaign`(admin은 @Put): campaign 생성. token은 스키마 `@default(uuid())`로 자동. advertising_id로 advertising을 tracker include 조회 → `tracker_name`=tracker.name, `tracker_tracking_url`=tracker.tracking_url 복사(denormalized). media_id·name·type도 저장. 생성 후 campaign_config 기본 이벤트 1개(admin_event_name='install' 등 스키마 기본값) 생성.
- `DELETE /campaign/:id`: 삭제(campaign_config는 schema상 onDelete Cascade).
- `PATCH /campaign/:id`: is_active 토글(admin status 토글 대응).
- `GET /campaign/:id`: 조회(campaign_config include).
- `GET /campaign/:id/event`: campaign_config 목록.
- `PATCH /campaign/:id/event`: 해당 campaign의 campaign_config 전체 삭제 후 body로 재생성(admin patchRegisteredEvent의 remove-then-recreate 대응).

### 트래킹 파이프라인 제약(깨지 말 것)
- tracking use-case가 campaign의 `token`/`tracker_name`/`tracker_tracking_url`과 `campaign_config`(send_media/tracker_event_name/admin_event_name/media_event_name)를 실제로 쓴다. 생성 시 이 필드들을 정확히 채워야 새 캠페인이 트래킹된다.
- campaign_config 복합 unique: `[campaign_id, admin_event_name]`. event 교체 시 중복 admin_event_name 주의.

### 구현 결과(완료, e2e만 사용자 검증 대기)
- 4계층. repository 하나(`PrismaCampaignRepository`)에 campaign CRUD + advertising/media 조회 + config 조작을 모음(과한 분리 회피). advertising→tracker는 `findAdvertisingTracker`로 tracker_name/tracker_tracking_url만 도출.
- use-case 6개: create/delete/toggle/get/list-config/replace-config. delete·toggle·get·replace는 findById로 존재 검증 후 없으면 NotFound.
- 생성: `campaign.create({ data: { ...props, campaign_config: { create: {} } } })`로 기본 config 1개 동시 생성(스키마 기본값 install). token은 `@default(uuid())`라 명시 안 함.
- config 교체: `$transaction([deleteMany, createMany])`로 remove-then-recreate 원자 처리.
- 컨트롤러: POST(admin @Put→POST)/DELETE:id/PATCH:id(토글)/GET:id/GET:id/event/PATCH:id/event. 배열 body는 `ParseArrayPipe({ items: ReplaceConfigDto })`로 요소 검증. JwtAuthGuard + ResponseInterceptor.
- 신규 테스트 46개, campaign 전 계층 4지표 100%.

### ⚠️ 재사용 교훈: @Type DTO는 spec에 reflect-metadata import 필요
- `@Type(() => Number)` 같은 변환 데코레이터가 있는 DTO는 화살표 함수가 실행돼야 functions 커버리지가 채워진다. `plainToInstance`로 변환하는 DTO 단위 spec을 추가할 것.
- 단, **그 DTO spec 최상단에 `import 'reflect-metadata';`가 없으면 `Reflect.getMetadata is not a function`으로 suite가 통째로 실패**한다(use-case spec은 @nestjs/testing이 reflect-metadata를 로드해줘서 문제 없지만, 순수 plainToInstance만 하는 DTO spec은 직접 import해야 함). 앞으로 @Type 있는 DTO마다 이 패턴 반복.
- 지금까지 도메인(user/advertiser/media/tracker) DTO는 문자열 위주라 @Type이 없어 이 이슈가 없었다. campaign에서 처음 등장.

### spec의 unbound-method 경고는 기존 컨벤션
- `expect(useCase.execute).toHaveBeenCalledWith(...)` 패턴은 tracking·postback 등 **기존 모든 controller/strategy spec에 이미 있는** unbound-method 경고를 낸다(에러 아님). campaign도 동일 패턴 유지. 여기만 고치면 스타일 불일치라 두는 게 맞다.

## 6단계 advertising — 진행 중(2026-07-10)

admin advertising.service는 294줄, 11개 엔드포인트. 압도적으로 큼.

### 범위 결정(사용자 확정)
- **CRUD + 통계**까지. **S3 이미지 업로드 제외**(monorepo에 S3 인프라 없고 실제 AWS 자격증명 필요 → 실물 검증 불가).
- 이미지는 **image URL 문자열을 body로 직접 받아** `image` 컬럼에 저장(파일 업로드 대신). S3 실물은 나중에 포트-어댑터로.
- **엑셀**: admin `getAdvertisingDailyDetailExcel`은 실제 xlsx 생성이 아니라 **필터 없는 전체 데이터 반환**일 뿐(서비스에 xlsx 코드 없음). xlsx 라이브러리 불필요, 그냥 조회 엔드포인트로 이관.

### 스키마 결정: 현재 컬럼 그대로(사용자 확정, 마이그레이션 0)
advertising 현재 컬럼: id, name, image(nullable), advertiser_id, tracker_id (+campaign 관계). admin이 쓰던 platform/status/created_at 없음. 처리:
- `platform` → **제외**(그룹핑/필드 없이).
- `created_at` → **제외**, 목록 정렬은 `id DESC`로 대체.
- `imageUrl`+CloudFront CDN 치환 → `image` 그대로 반환, CDN 치환 없음.
- **`status`는 campaign.is_active로 대체(사용자 확정, "둘 다")**:
  - 토글(PATCH /advertising/:idx): advertising status 컬럼 없이, 딸린 campaign들의 is_active를 전부 false로(admin patchAdvertisingStatus 동작).
  - 조회 응답 status: 파생값. **딸린 campaign 중 is_active=true가 1개라도 있으면 true**, 없으면 false.

### 통계 소스: daily_report (admin PostbackDaily 대응)
- admin `PostbackDaily.createdAt`(datetime) ↔ monorepo `daily_report.created_date`(@db.Date). 날짜 범위 필터가 여기.
- 카운터(click/install/registration/retention/purchase/revenue/etc1~5/unregistered) 전부 일치.
- join 경로: `daily_report.token → campaign.token → campaign.advertising_id`. admin과 동일.
- 통계는 Prisma `groupBy`/`aggregate`로 재작성(raw SQL 대체).

### 엔드포인트(현재 스키마 기준, patchAdvertisingStatus는 campaign 토글로 이관)
- POST /advertising(생성, image URL), GET /advertising(목록+검색+페이징+campaign카운트+파생status), GET /advertising/list(간략+tracker명), GET /advertising/:idx(정보), GET /advertising/campaign/:idx(캠페인목록), PATCH /advertising/:idx(딸린 campaign is_active 토글)
- 통계: GET dashboard/daily/detail/:idx/dailydetail/dailydetail/excel

### 구현 결과(완료, e2e만 사용자 검증 대기)
- 4계층. repository 하나에 CRUD + 통계 5종. use-case 11개(create/list/brief/info/campaignList/deactivate + dashboard/daily/detail/dailyDetail/dailyDetailAll).
- **통계 쿼리 전략**: 관계 조인 그룹핑(daily_report→campaign→advertising/media)은 `$queryRaw`(dashboard, detail). 단일 테이블 그룹핑(token 기준 daily)은 Prisma `groupBy`. `CAST(SUM(...) AS SIGNED)`로 BigInt 회피.
- **파생 status**: list에서 `_count: { campaign: { where: { is_active: true } } }`로 활성 캠페인 수를 세고 `> 0`이면 status=true. Prisma가 _count에 where 필터를 지원.
- **토글 재해석**: PATCH /advertising/:id → `campaign.updateMany({ where: { advertising_id }, data: { is_active: false } })`. advertising엔 status 컬럼 없음.
- 컨트롤러 라우트 순서: **정적 경로(list/dashboard/daily/dailydetail/dailydetail/excel/detail/:id/campaign/:id)를 `:id`보다 먼저** 선언(안 그러면 `:id`가 먼저 잡아먹음). admin 원본의 잠재 버그를 이관하며 교정.
- 신규 테스트 45개, advertising 전 계층 4지표 100%.

### 재사용 교훈: 반복 매핑은 헬퍼로 추출(중복 = branch 커버리지 2배 부담)
- daily/dailyDetailAll의 `_sum.x ?? 0` 매핑 12필드가 두 메서드에 중복돼 있어 branch 커버리지가 46%까지 떨어졌다. `?? 0`이 각 위치마다 "값/null" 두 분기를 요구하기 때문. **매핑을 모듈 스코프 `mapDailyRow` 함수 + `DAILY_SUM_SELECT` 상수로 추출**하니 한 함수만 양쪽 분기(값 있는 행 + 전부 null 행) 태우면 100%. 코드도 짧아짐. 통계 반복 매핑이 나오면 항상 추출할 것.
- `$queryRaw`의 삼항 분기(`media_id !== undefined ? Prisma.sql : Prisma.empty`)는 repository spec에서 **media_id 있는/없는 두 케이스**를 모두 호출해야 branch가 찬다.
- strict 모드에서 `result[0].x`는 possibly-undefined 에러. `expect(result[0]).toEqual(...)` 또는 `objectContaining`으로 감쌀 것.
