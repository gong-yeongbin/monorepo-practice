# modules

도메인 기능 모듈. 각 모듈은 클린 아키텍처 4계층으로 나뉘며, 모든 기능 코드는 여기에 계층별로 배치한다. 모듈 목록은 루트 CLAUDE.md 참고.

## 4계층 (의존 방향: presentation → application → domain ← infrastructure)

- `domain/` — 도메인 타입(`*.entity.ts`의 `interface`), repository **인터페이스**, DI **심볼 토큰**. 프레임워크·Prisma 의존 없음.
- `application/` — use-case(`*.use-case.ts`). 도메인 조립·비즈니스 흐름. 테스트는 `*.use-case.spec.ts`로 나란히 둔다.
- `infrastructure/` — repository 구현체(`prisma-*.repository.ts`). domain 인터페이스를 implements.
- `presentation/` — 진입점. HTTP는 `*.controller.ts`, 스트림 수신은 `*.consumer.ts`. DTO는 `presentation/dto/` 또는 `application/dto/`.

## RESTful 엔드포인트 규칙 (presentation)

- URL 리소스 세그먼트는 **복수형 명사**를 쓴다 — `/users`, `/orders`. 불가산 명사·불규칙 복수형은 사전 기준을 따른다 — `/advertising`, `/media`(medium의 복수형).
- **URL에 동사를 넣지 않는다.** 행위는 HTTP 메서드로 표현한다 — `POST /orders`(○), `/order/create`(×).
- 메서드 의미: `GET` 조회(부수효과 금지, 컬렉션 `GET /resources`·단건 `GET /resources/:id`), `POST` 생성(201), `PATCH` 부분 수정, `PUT` 전체 교체(모든 필드 필수), `DELETE` 삭제.
- 허용 예외:
  - **인증 플로우** — `POST /auth/signup`, `POST /auth/signin` 등 관례적 동사 경로.
  - **외부에 이미 배포된 공개 URL** — 외부 시스템이 호출 중인 URL은 형태를 바꾸지 않는다.
  - **싱글턴·뷰 리소스** — 집계 뷰(`GET /dashboard`)나 부모당 하나뿐인 리소스는 복수형을 강제하지 않는다.
- 컨트롤러 클래스·모듈·폴더명은 단수형을 유지하고 URL만 복수형으로 쓴다. 예: `OrderController` + `@Controller('orders')`. `@ApiTags`는 컨트롤러 prefix와 같은 문자열을 쓴다.
- 엔드포인트를 추가·변경하면 관련 문서를 함께 갱신한다. 예: `.http` 호출 파일, README의 라우트 표.

## 인증·인가 (필수)

전역 `JwtAuthGuard` + `RolesGuard`(`auth/presentation/`, `AuthModule`에서 `APP_GUARD`로 등록)가 모든 라우트에 적용된다. **새 컨트롤러는 반드시 `@Roles(...)` 또는 `@Public()` 중 하나를 클래스에 붙인다.** 둘 다 없으면 403이다(데코레이터 누락으로 새 컨트롤러가 조용히 열리지 않게 하려는 의도).

- 역할 축은 `USER`(대시보드 조회) ⊂ `ADMIN`(광고 운영) ⊂ `DEVELOPER`(+ 사용자 관리·승인). 값의 단일 출처는 `user/domain/user.entity.ts`의 `USER_ROLES`다.
- 메서드 레벨 `@Roles`가 클래스 레벨을 덮는다. 컨트롤러 대부분을 ADMIN으로 두고 특정 조회만 USER에게 여는 식으로 쓴다(`advertising.controller.ts`의 `GET /advertising/:id` 참고).
- `@Public()`은 토큰 없이 호출되는 엔드포인트에만 쓴다 — 헬스체크, 트래킹·포스트백(외부가 호출), auth(토큰 발급 전). 포스트백은 인증 대신 `ThrottlerGuard`로 보호한다. **트래킹에는 rate limit이 없다** — `@nestjs/throttler`의 기본 인메모리 저장소가 IP 키를 지우지 않아 카디널리티가 무한한 이 경로에서 메모리·CPU를 무한히 먹기 때문이다(근거는 `tracking/presentation/tracking.controller.ts` 주석). 되살리려면 공유 저장소(Valkey) 기반이어야 한다.
- `JwtAuthGuard`가 `request.user`에 `AccessTokenPayload`를 싣는다. 가드는 인터셉터보다 먼저 실행되므로 401·403 응답은 `ResponseInterceptor`로 감싸지지 않는다.
- 핸들러에서 payload가 필요하면 `@CurrentUser()`(`auth/presentation/current-user.decorator.ts`)로 꺼낸다. `@Public` 라우트에는 payload가 없으므로 `@Roles`가 붙은 라우트에서만 쓴다.

## 광고 스코프 (USER 데이터 제한, 주의)

역할 축과 별개로 **`USER`는 `user_advertising`에 연결된 광고의 데이터만 조회**된다. `DEVELOPER`·`ADMIN`은 면제다.

- 면제 판정은 `auth/application/advertising-scope.ts` **한 곳**에서만 한다. 컨트롤러가 `advertisingScopeOf(user)`로 스코프를 만들어 use-case에 넘기고, 라우트·repository는 role을 다시 보지 않는다.
- `AdvertisingScope` 규약: `undefined` = 제한 없음(면제), `[]` = **아무 광고도 못 봄**(전체 허용이 아니다). `advertisingScopeOf`의 `?? []`를 지우면 `advertising_ids`가 없던 구 access token(최대 15분 생존)으로 스코핑이 뚫린다.
- 적용 방식은 두 갈래다. **목록·집계**는 scope를 repository까지 넘겨 SQL에서 거르고(`prisma-dashboard.repository.ts`), **단건 키**(`:id`·token)는 use-case가 `isAdvertisingAllowed`로 조기 반환한다.
- **스코프 위반에 403을 쓰지 않는다.** 프론트 `app.tsx`의 `QueryCache.onError`가 403을 세션 만료로 보고 로그아웃시킨다. 목록은 빈 배열, 단건은 404로 응답한다.
- raw SQL에 스코프를 넣을 때는 빈 배열을 먼저 걸러야 한다 — `Prisma.join([])`은 예외를 던지고 `IN ()`은 SQL 문법 오류다. Prisma의 `in: []`은 안전하다(항상 거짓인 조건이 된다).

## 도메인 타입 규칙 (domain, 주의)

이 프로젝트는 **클린 아키텍처**다. 의존성은 안쪽(domain)으로만 향하며 **domain은 Prisma를 모른다**. repository port·application·domain 어디서도 `@prisma/client`를 import하지 않는다. Prisma는 `infrastructure/`에만 갇힌다.

- `domain/*.entity.ts`는 **class가 아니라 `interface`**다(행동 없는 데이터 타입). 필드는 **DB 컬럼과 같은 snake_case**(예: `tracker_name`, `created_date`). Prisma에 그대로 넘겨 저장하기 위함.
- 생성은 생성자/static 팩토리 대신 **use-case에서 객체 리터럴** 또는 domain의 **팩토리 함수**로 한다.
  - `createPostback(props)` — tracker 필드(camelCase)를 저장용 `Postback`(snake_case)으로 매핑.
  - `createDailyReport(props)` — 카운터를 0으로 초기화한 빈 리포트 생성(이후 use-case가 `+= 1`로 누산).
- Prisma row를 domain 타입으로 **재포장하지 않는다**. row가 domain interface와 구조적으로 호환되면 repository에서 그대로 반환한다(`prisma-campaign.repository.ts` 참고).

## Repository 패턴 (infrastructure, 필수)

domain에 인터페이스 + 심볼 토큰을 정의하고, 모듈에서 `useClass`로 구현을 바인딩한다.

```ts
// domain/postback.repository.ts
export const POSTBACK_REPOSITORY = Symbol('POSTBACK_REPOSITORY');
export interface PostbackRepository { createMany(postbacks: Postback[]): Promise<void>; }

// *.module.ts
{ provide: POSTBACK_REPOSITORY, useClass: PrismaPostbackRepository }

// use-case에서 주입
@Inject(POSTBACK_REPOSITORY) private readonly repo: PostbackRepository
```

use-case는 절대 `PrismaService`를 직접 주입하지 않는다. 항상 repository 인터페이스를 거친다.

## 테스트 (필수)

`modules/` 아래 모든 코드는 테스트를 **무조건** 작성한다. 커버리지는 `modules/` 기준 4지표(statements·branch·functions·lines) **모두 90% 이상**을 유지한다(`pnpm test:cov`).

- spec 파일은 대상 소스와 **같은 폴더에 나란히** 둔다: `*.use-case.spec.ts`, `*.repository.spec.ts`, `*.controller.spec.ts`, `*.consumer.spec.ts`, `*.entity.spec.ts`.
- 계층별 방식:
  - `domain/` 팩토리(`createPostback`·`createDailyReport`)는 순수 함수라 **직접 호출**로 검증.
  - `application/` use-case는 `Test.createTestingModule`로 repository·`StreamProducer`·`CachePort`를 `jest.fn()`으로 목킹. `TRACKERS`가 반환하는 값을 제어해야 하면 `jest.mock('@trackers/tracker.registry')`.
  - `infrastructure/` repository는 `PrismaService`를 목킹. daily-report는 raw 배치 upsert(`$executeRaw`)라 **빈 배치 스킵·SQL 생성(ON CONFLICT DO UPDATE)·예외 전파**를 검증.
  - `presentation/` controller는 use-case 위임을, consumer는 `StreamConsumer.register(stream, handler)` 호출과 핸들러 위임을 검증.
- `*.module.ts`(DI 배선 전용)는 커버리지 대상에서 제외한다(`package.json`의 jest `collectCoverageFrom`에 `!**/*.module.ts`). 로직이 없어 단위 테스트 대상이 아니다.
- `Promise.allSettled`로 실패를 격리하는 use-case는 **개별 upsert 실패 경로**도 반드시 케이스로 남긴다.

## 새 기능 추가 시

- 새 모듈이면 `modules/<이름>/`에 4계층 폴더 + `<이름>.module.ts`를 만들고 `app.module.ts`에 등록한다.
- 스트림을 소비하면 `presentation/*.consumer.ts`에서 `StreamConsumer.register(stream, handler)`를 호출한다(`postback.consumer.ts` 참고).
- import 별칭: `@tracking/*`, `@postback/*` (모듈별로 있음). 상대 경로 대신 별칭을 쓴다.
