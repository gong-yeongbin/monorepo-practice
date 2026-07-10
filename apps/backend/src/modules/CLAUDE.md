# modules

도메인 기능 모듈. 각 모듈(`tracking`, `postback`)은 클린 아키텍처 4계층으로 나뉜다. 모든 기능 코드는 여기에 계층별로 배치한다.

## 4계층 (의존 방향: presentation → application → domain ← infrastructure)

- `domain/` — 도메인 타입(`*.entity.ts`의 `interface`), repository **인터페이스**, DI **심볼 토큰**. 프레임워크·Prisma 의존 없음.
- `application/` — use-case(`*.use-case.ts`). 도메인 조립·비즈니스 흐름. 테스트는 `*.use-case.spec.ts`로 나란히 둔다.
- `infrastructure/` — repository 구현체(`prisma-*.repository.ts`). domain 인터페이스를 implements.
- `presentation/` — 진입점. HTTP는 `*.controller.ts`, 스트림 수신은 `*.consumer.ts`. DTO는 `presentation/dto/` 또는 `application/dto/`.

## Repository 패턴 (필수)

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

## 도메인 타입 규칙 (주의)

이 프로젝트는 **클린 아키텍처**다. 의존성은 안쪽(domain)으로만 향하며 **domain은 Prisma를 모른다**. repository port·application·domain 어디서도 `@prisma/client`를 import하지 않는다. Prisma는 `infrastructure/`에만 갇힌다.

- `domain/*.entity.ts`는 **class가 아니라 `interface`**다(행동 없는 데이터 타입). 필드는 **DB 컬럼과 같은 snake_case**(예: `tracker_name`, `created_date`). Prisma에 그대로 넘겨 저장하기 위함.
- 생성은 생성자/static 팩토리 대신 **use-case에서 객체 리터럴** 또는 domain의 **팩토리 함수**로 한다:
  - `createPostback(props)` — tracker 필드(camelCase)를 저장용 `Postback`(snake_case)으로 매핑.
  - `createDailyReport(props)` — 카운터를 0으로 초기화한 빈 리포트 생성(이후 use-case가 `+= 1`로 누산).
- Prisma row를 domain 타입으로 **재포장하지 않는다**. row가 domain interface와 구조적으로 호환되면 repository에서 그대로 반환한다(`prisma-campaign.repository.ts` 참고).

## 새 기능 추가 시

- 새 모듈이면 `modules/<이름>/`에 4계층 폴더 + `<이름>.module.ts`를 만들고 `app.module.ts`에 등록한다.
- 스트림을 소비하면 `presentation/*.consumer.ts`에서 `StreamConsumer.register(stream, handler)`를 호출한다(`postback.consumer.ts` 참고).
- import 별칭: `@tracking/*`, `@postback/*` (모듈별로 있음). 상대 경로 대신 별칭을 쓴다.
