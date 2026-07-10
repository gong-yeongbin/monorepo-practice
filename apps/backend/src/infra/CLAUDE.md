# infra

외부 시스템(Redis, MySQL)과의 연결·어댑터를 담는 계층. 각 하위 폴더는 하나의 인프라 관심사를 캡슐화하는 NestJS 모듈이며, 도메인 로직은 절대 두지 않는다.

## 구조

- `prisma/` — `PrismaService`(연결 수명주기)와 `PrismaModule`. Prisma 7이라 driver adapter(`@prisma/adapter-mariadb`)로 `DATABASE_URL`에 연결한다.
- `cache/` — Redis 캐시. `CachePort` 인터페이스 + `CACHE_PORT` 심볼 토큰, `RedisCacheAdapter` 구현. **TTL은 밀리초 단위**로 받아 `PX`로 넘긴다.
- `stream/` — Redis Stream 프로듀서/컨슈머. 비동기 메시징(구 Kafka).

## 포트-어댑터 패턴

`cache`는 포트/어댑터로 분리돼 있다. 소비하는 쪽은 구현이 아니라 포트에 의존한다.

```ts
// 주입: @Inject(CACHE_PORT) private readonly cache: CachePort
// 모듈 등록: { provide: CACHE_PORT, useClass: RedisCacheAdapter }
```

새 인프라를 추가할 때 소비처가 구현 세부를 몰라도 되면 이 패턴(심볼 토큰 + 인터페이스 + 어댑터)을 따른다.

## Redis 연결 분리 (주의)

Stream 컨슈머의 `XREADGROUP BLOCK`은 연결을 장시간 점유하므로 **캐시 연결과 스트림 연결을 분리한 별도 ioredis 클라이언트**를 쓴다(`REDIS_CACHE_CLIENT` vs `REDIS_STREAM_CLIENT`). 둘을 합치지 말 것.

`StreamConsumer` 세부:
- `register(stream, handler)`는 `OnApplicationBootstrap`의 소비 루프 시작 **전**에 끝나야 한다. 그래서 소비자 어댑터는 `OnModuleInit`에서 등록한다.
- 배치 처리 후 성공/실패와 무관하게 ID를 `xack`한다(poison pill로 인한 무한 재소비 방지). at-least-once가 아니라 at-most-once에 가까움을 인지할 것.

## 규칙

- import 별칭은 `@infra/*`.
- 새 하위 폴더는 자체 `*.module.ts`로 프로바이더를 캡슐화하고 필요한 것만 `exports`한다.
