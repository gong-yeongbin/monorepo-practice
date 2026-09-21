# 광고 트래킹 플랫폼 재구축

---

## 0. 선택한 기술 스택 정리

답변 골격은 "정의 한 줄 → 왜 골랐나 → 이 프로젝트에서 어디에 쓰였나"다.

### Terraform

HashiCorp의 IaC 도구다. HCL로 원하는 상태를 선언하면 `plan`이 diff를 보여주고 `apply`가 반영한다. state 파일이 현재 상태를 기록해 재현·리뷰·롤백이 된다.

콘솔(GUI)과 비교하면 이렇다.

| | 콘솔 (GUI) | Terraform |
|---|---|---|
| 재현 | 클릭 순서를 기억해야 한다 | `apply` 한 번이면 같은 환경이 나온다 |
| 리뷰 | 무엇을 바꿨는지 남이 볼 수 없다 | `.tf`가 git에 있어 PR로 diff를 본다 |
| 변경 예측 | 저장하면 바로 반영된다 | `plan`이 생성·변경·삭제를 먼저 보여준다 |
| 롤백 | 이전 설정을 기억해 손으로 되돌린다 | git revert 후 `apply` |
| 드리프트 | 누가 손댔는지 알 수 없다 | `plan`이 state와 실제의 차이를 잡는다 |

한 줄로 답하면 "콘솔은 결과만 남고 과정이 안 남는데, Terraform은 과정이 코드로 남아 재현·리뷰·롤백이 되고 적용 전에 diff를 본다"다. 8개 모듈이 VPC·서브넷·보안그룹 ID를 서로 참조하는데, 콘솔이면 ID 복사·붙여넣기를 수십 번 해야 할 것을 `module.network.vpc_id`처럼 참조해 의존을 도구가 푼다.

이 프로젝트는 network·backend·database·cache·ecr·frontend·acm·bastion 8개 모듈을 `envs/prod`에서 조립한다. state 버킷은 bootstrap으로 한 번만 만든다. 시크릿은 Terraform이 생성해 SSM에만 넣어 tfvars에 비밀이 없다. SES는 일부러 밖에 뒀다. 레거시가 만든 도메인 identity를 소유하면 destroy 한 번에 레거시 메일까지 끊긴다.

### Turborepo

모노레포 빌드 오케스트레이터다. `turbo.json`의 태스크 의존(`dependsOn: ["^build"]`) 순서대로 병렬 실행하고 입력 해시로 캐시해 안 바뀐 패키지는 건너뛴다. `apps/backend`·`apps/frontend`·`packages/*`의 build·lint·check-types·test·dev를 루트에서 한 번에 돌린다.

### pnpm과 npm의 차이

| | npm | pnpm |
|---|---|---|
| 저장 방식 | 프로젝트마다 node_modules에 복사 | 전역 store에 한 번, hard link |
| node_modules 구조 | flat(hoisting) | 심볼릭 링크 기반 nested |
| 유령 의존성 | package.json에 없는 패키지도 import 가능 | 선언한 것만 접근 가능 |
| 워크스페이스 | 지원 | `--filter`로 개별 실행 |

모노레포에서 pnpm을 고른 이유는 의존성 격리와 워크스페이스 필터다. npm hoisting은 어떤 앱이 다른 앱의 의존성을 우연히 쓰게 하는데 pnpm은 선언하지 않으면 import가 실패한다.

### NestJS

Express 위에 모듈·프로바이더·컨트롤러 구조와 DI 컨테이너, 데코레이터 기반 라우팅을 얹은 Node.js 서버 프레임워크다.

고른 이유는 둘이다. 레거시가 이미 NestJS라 학습 비용이 없었다. 그리고 DI 컨테이너가 있어야 "인터페이스 + 심볼 토큰 + `useClass` 바인딩"으로 use-case가 구현체 대신 인터페이스에 의존할 수 있고, 그래서 repository를 `jest.fn()`으로 갈아 끼우면 DB 없이 테스트가 끝난다.

이 프로젝트는 AppModule 하나를 `main.ts`가 HTTP 앱으로 띄우고 같은 express 인스턴스를 3001(어드민)·3002(트래킹) 두 포트에 listen한다. 운영은 이 단일 프로세스가 API·컨슈머·스케줄러를 모두 돌린다. `main.consumer.ts`는 `createApplicationContext`로 HTTP 없이 컨슈머만 띄우는 진입점이고 `APP_ROLE`로 역할을 가르지만, 현재 운영 이미지는 실행하지 않는다.

"Express를 그냥 쓰지 않은 이유"는 DI와 모듈 경계다. "Fastify로 안 바꾼 이유"는 병목이 DB 왕복이지 HTTP 파싱이 아니었기 때문이다.

근거 `apps/backend/src/main.ts`, `src/main.consumer.ts`, `Dockerfile` CMD

### NestJS 라이프사이클

두 축이 있다. 앱의 부팅·종료 훅과 요청 파이프라인이다. 면접에서 물으면 어느 쪽인지 되묻는다.

**(1) 애플리케이션 훅.** 이 프로젝트가 쓰는 것은 셋이다.

| 훅 | 시점 | 이 프로젝트에서 |
|---|---|---|
| `OnModuleInit` | 모듈별로, 프로바이더 해석 직후 | `PrismaService.$connect()`. 각 컨슈머가 `StreamConsumer.register(stream, handler)` |
| `OnApplicationBootstrap` | 모든 모듈 init 완료 후 한 번 | `StreamConsumer`가 스트림별 연결을 만들고 소비 루프 시작 |
| `OnApplicationShutdown` | SIGTERM/SIGINT 수신 시 | 루프를 멈추고 in-flight 배치를 `await`한 뒤 Redis 연결 종료 |

등록과 시작을 나눈 이유가 핵심이다. 등록이 끝나기 전에 루프가 돌면 그 스트림은 소비되지 않는다. Nest가 "모든 모듈 init → bootstrap" 순서를 보장하므로 누락이 없다.

종료 훅은 기본으로 꺼져 있어 `app.enableShutdownHooks()`가 필요하다. 이게 배포·Spot 회수 때 처리 중이던 배치를 지키는 장치다. 함정은 이 훅이 Nest가 만든 서버만 닫는다는 것이다. 3002 서버는 `createServer`로 직접 만들었으므로 `process.once('SIGTERM')`으로 따로 닫는다. 안 닫으면 열린 핸들 때문에 프로세스가 안 끝나 ECS가 SIGKILL할 때까지 배포가 지연된다.

근거 `stream-consumer.service.ts:50`, `main.ts:74-84`

**(2) 요청 파이프라인.** 미들웨어 → 가드 → 인터셉터(전) → 파이프 → 핸들러 → 인터셉터(후) → 예외 필터 순이다.

| 단계 | 하는 일 | 접근 가능한 것 | 실행 시점 | 이 프로젝트 |
|---|---|---|---|---|
| 미들웨어 | 요청 자체를 통과·차단 | req/res 원본만 | 라우트 매칭 전 | 3002 포트 경로 필터 |
| 가드 | 권한 판단 (true/false) | ExecutionContext, 핸들러 메타데이터 | 라우트 매칭 후, 핸들러 전 | JwtAuthGuard·RolesGuard |
| 인터셉터 | 핸들러 전후를 감싸 변환 | ExecutionContext + 핸들러의 반환값 | 핸들러 전과 후 양쪽 | ResponseInterceptor |
| 파이프 | 인자 검증·변환 | 핸들러 인자 값과 타입 메타데이터 | 핸들러 직전, 인자 단위 | ValidationPipe |
| 예외 필터 | 던져진 예외를 응답으로 | 예외 객체 + host | 예외 발생 시에만 | 기본 필터 사용 |

- 미들웨어. 3002로 들어온 요청은 공개 경로 4개 외에 404다. 가드보다 앞이라 인증 코드에 닿기 전에 걸러진다.
- 가드. `JwtAuthGuard`·`RolesGuard`를 `APP_GUARD`로 전역 등록. 어느 모듈에 등록해도 전역이라 `JwtService`가 있는 `AuthModule`에 뒀다.
- 파이프. 전역 `ValidationPipe({ whitelist: true, transform: true })`. DTO에 없는 필드는 버리고 쿼리 문자열을 타입대로 변환한다.
- 인터셉터. 어드민 컨트롤러에만 `ResponseInterceptor`. 트래킹은 302 바디를 만들면 안 되므로 안 붙인다.

주의점은 가드가 인터셉터보다 먼저라 401·403은 `ResponseInterceptor`를 거치지 않는다는 것이다. "미들웨어와 가드의 차이"는 미들웨어에 `ExecutionContext`가 없어 `@Roles` 메타데이터를 못 읽는다는 점이다.

근거 `main.ts:47-60`, `modules/auth/auth.module.ts:29-30`

### ORM이란

객체(클래스·타입)와 관계형 DB의 테이블을 서로 대응시켜, SQL 대신 코드로 데이터를 읽고 쓰게 해 주는 계층이다.

### Prisma (TypeORM 대신 쓴 이유)

`schema.prisma` 하나에서 타입이 붙은 클라이언트를 생성하는 ORM이다. 레거시는 TypeORM, 신규는 Prisma 7이다.

바꾼 이유는 **조인의 타입 안전성**이다. TypeORM은 `relations: ['media']`처럼 관계를 문자열로 적어서 오타나 누락이 런타임에야 드러난다. Prisma는 `include: { media: true }`가 스키마에서 생성된 타입이라 없는 관계명은 컴파일 에러이고, include하지 않은 관계에 접근하는 코드도 `tsc`에서 막힌다. 이관 때 12개 모듈의 쿼리를 다시 썼는데 잘못된 조인이 전부 컴파일에서 걸렸다.

부수 이유는 둘이다. 스키마가 단일 출처라 마이그레이션 SQL을 자동 생성해 검토 후 적용한다. 엔티티에 데코레이터가 없어 domain 타입을 순수 `interface`로 두고 "domain은 Prisma를 모른다"를 지키기 쉽다.

잃은 것은 동적 쿼리 조립이다. daily_report 배치 upsert는 `$executeRaw`로 직접 썼다.

근거 `docs/migration/plan.md` ORM 교체, `modules/campaign/infrastructure/prisma-campaign.repository.ts:19,36`

### Valkey

Redis의 오픈소스 포크다. 2024년 Redis 라이선스 변경 후 Linux Foundation 아래에서 Redis 7.2 기반으로 갈라졌고, 프로토콜과 명령이 같아 ioredis를 그대로 쓴다. ElastiCache에서 Redis OSS 대비 약 20% 저렴하다.

이 프로젝트에서는 캠페인 스냅샷 캐시와 Redis Stream 메시지 큐 두 역할이고, 둘은 별도 ioredis 연결을 쓴다. "Redis 대신 쓴 이유"는 라이선스·비용·코드 변경 0이다.

### Valkey(Redis) Stream

Redis 5부터 있는 append-only 로그 자료구조다. Kafka 토픽과 비슷하되 단일 노드 안에서 동작한다. Pub/Sub과 달리 메시지가 남고, List와 달리 consumer group으로 나눠 읽으며 PEL(Pending Entries List)로 재전달을 보장한다. 구 Kafka를 대체했다. 캐시용 Valkey가 이미 있어 추가 비용이 0이고 일 1억 건은 단일 노드로 충분하다.

이 프로젝트가 실제로 쓰는 명령은 여섯 개다. 클릭 하나가 흐르는 순서대로 적는다.

| 명령 | 하는 일 | 이 프로젝트에서 |
|---|---|---|
| `XGROUP CREATE` | 스트림에 consumer group 생성 | 컨슈머 시작 시 한 번. `$`(지금 이후부터), `MKSTREAM`(없으면 생성). 이미 있으면 `BUSYGROUP` 에러라 무시 |
| `XADD` | 엔트리 추가 | 클릭 수신 시 `MAXLEN ~ 2000000`으로 상한. `*`로 ID 자동 생성(`밀리초-순번`이라 시간순 보장). `~`는 근사 트림이라 빠름 |
| `XREADGROUP` | 그룹으로 읽기 | `>`는 "그룹 누구에게도 안 간 새 메시지". `COUNT 5000`, `BLOCK 5000`. 돌려주는 순간 PEL에 "받아 갔고 미확인"으로 기록됨 |
| `XACK` | 처리 완료 표시 | 핸들러 성공 시에만. PEL에서만 지우고 엔트리는 남는다. 그래서 길이는 MAXLEN이 관리 |
| `XAUTOCLAIM` | 유휴 PEL 회수 | 60초 이상 XACK 안 된 메시지의 소유권을 나에게 넘김. 죽은 컨슈머 몫 회수. 반환 커서를 다음 호출에 이어 넘김 |
| `XPENDING` | PEL 상세 조회 | 회수한 메시지의 전달 횟수 확인. 3회 이상이면 poison pill로 보고 처리 없이 XACK으로 폐기 |

한 루프의 순서는 이렇다.

```
XAUTOCLAIM(죽은 컨슈머 몫 회수) → XPENDING(횟수 확인, 3회↑ 폐기)
→ XREADGROUP BLOCK(새 메시지) → 200ms linger → XREADGROUP 논블로킹(추가분)
→ 핸들러(DB upsert) → XACK
```

면접에서 짚을 포인트는 셋이다. XACK이 엔트리를 지우지 않아 MAXLEN이 필요하다. XREADGROUP이 돌려준 순간 PEL에 들어가서 XACK 전에 죽으면 XAUTOCLAIM으로 다른 컨슈머가 가져간다. 그래서 DB 커밋과 XACK 사이에 죽으면 중복 집계 창이 생긴다.

근거 `src/infra/stream/stream-producer.service.ts:21`, `stream-consumer.service.ts:93-172`

**linger 배치.**

linger는 "바로 처리하지 않고 잠깐 기다려 더 모은 뒤 한 번에 처리한다"는 배치 기법이다. Kafka 프로듀서의 `linger.ms`가 같은 개념이다. 대기한 만큼 지연은 늘지만 한 번에 처리하는 양이 커져 왕복 횟수가 줄어든다.

이 프로젝트에 필요한 이유는 XREADGROUP의 동작 때문이다. `COUNT 5000`을 줘도 메시지가 1건만 있으면 즉시 1건을 돌려준다. 유입이 초당 1,000건이면 컨슈머가 읽을 때마다 몇 건씩만 받게 되고, 배치당 DB upsert 한 문장이므로 메시지 수만큼 DB 왕복이 생긴다.

그래서 첫 읽기가 5,000을 못 채우면 200ms 기다렸다가 `BLOCK` 없이 한 번 더 읽어 그동안 쌓인 것을 합친다. 유입이 없으면 첫 `BLOCK`이 null을 돌려줘 여기까지 오지 않으므로 유휴 시 비용은 0이다. 대가는 집계 반영이 200ms 늦어지는 것뿐이라 일별 리포트에는 영향이 없다.

```
XREADGROUP COUNT 5000 BLOCK 5000   → 예: 300건
(5000 미만이면) 200ms 대기
XREADGROUP COUNT 4700              → 그 사이 쌓인 200건 추가
→ 500건을 upsert 한 문장으로
```

근거 `redis-stream.constants.ts` STREAM_LINGER_MS_DEFAULT 주석, `stream-consumer.service.ts` linger()

### ALB와 NLB

| | ALB | NLB |
|---|---|---|
| 계층 | L7 (HTTP) | L4 (TCP) |
| 라우팅 | 경로·호스트·헤더로 분기 | 포트로만 분기 |
| 부가 기능 | TLS 종료, WAF, X-Forwarded-For | 없음 (`preserve_client_ip`로 소켓 IP 보존) |
| 과금 기준 | 신규 연결 25/s당 1 LCU | 신규 연결 800/s당 1 NLCU |

NLB가 싼 이유는 하는 일이 적기 때문이다. ALB는 연결마다 HTTP를 파싱하고 TLS를 풀고 리스너 규칙을 평가하고 헤더를 붙여야 하므로 연결당 CPU를 쓴다. NLB는 패킷을 열어보지 않고 TCP 수준에서 대상으로 넘기기만 하므로 같은 자원으로 훨씬 많은 연결을 받는다. 그래서 AWS가 용량 단위당 허용 연결 수를 32배 높게 잡고(25/s vs 800/s), 단가도 서울 기준 시간당 $0.008 vs $0.006으로 더 낮다.

LCU는 신규 연결·활성 연결·처리 바이트·규칙 평가 네 차원 중 **최댓값 하나**로 과금된다. 클릭 트래킹은 302 한 번 받고 끊는 짧은 연결이 초당 1,000개 이상이라 신규 연결이 지배하고, 그 기준값이 32배 차이 난다. 초당 1,157 연결이면 ALB 월 약 $270, NLB 월 약 $35다.

그래서 매체에 배포된 트래킹 링크는 NLB 80, 어드민 API는 ALB HTTPS로 나눴다. 태스크 하나가 3001·3002를 모두 열고, NLB는 경로를 못 보므로 3002는 앱이 공개 경로 4개만 통과시킨다. 대가는 WAF 불가, XFF 없음, 경로 필터링을 앱이 대신하는 것이다.

**트래킹 요청이 NLB에 맞는 이유.** ALB가 하는 L7 기능이 트래킹에는 전부 필요 없고, 트래픽 모양은 NLB 과금에 유리하다.

| 트래킹 요청의 성격 | 결과 |
|---|---|
| GET 한 줄 받고 302 응답 후 바로 끊는 일회성 연결 | 신규 연결 수가 과금을 지배하고, 이 차원은 NLB가 32배 유리 |
| 응답이 헤더뿐이라 클릭당 200바이트 남짓 | 처리 바이트 차원이 작아 NLB에서도 4.2 NLCU에 그침 |
| 매체에 배포된 링크가 `http://` 평문이라 TLS 종료가 필요 없음 | ALB의 TLS 기능을 안 씀 |
| 경로가 `/tracking`·`/*/install`·`/*/event`·`/health` 넷뿐 | 경로 라우팅이 필요 없고 앱의 정규식 한 줄로 대신함 |
| 브라우저 top-level 리다이렉트라 CORS·쿠키·세션 없음 | 헤더 조작이 필요 없음 |
| 클라이언트 IP는 `preserve_client_ip`로 소켓에 보존 | X-Forwarded-For가 필요 없음 |

반대로 어드민 API는 HTTPS, CORS, 여러 경로, JWT 헤더가 필요해 ALB에 남겼다. 한 줄로 답하면 "트래킹은 L7 기능을 하나도 안 쓰면서 연결 수만 많은 트래픽이라, 연결 수에 32배 관대한 NLB가 맞다"이다.

---

## 1. 먼저 고칠 것

이력서는 "전체 청구액의 48%였던 AZ 간 전송료를 0으로"라고 썼다. Terraform README의 2026-07 청구서 분석은 다르다.

| 항목 | 금액 | 비중 |
|---|---|---|
| Data Transfer 전체 | $865 | 48% |
| 그중 AZ 간 전송(Regional-Bytes) | $233 | 약 13% |
| 그중 인터넷 egress(Out-Bytes) | $632 | 단일 AZ로 안 줄어듦 |

"전송료 48% 중 AZ 간 전송 $233을 0으로"로 고친다. "40~55% 절감"도 설계 시점 추정치다. 컷오버 후 실청구액을 확인해 두면 가장 강한 답이 된다.

---

## 2. 예상 질문과 답변

### AWS 비용 최적화

**Q. AZ 간 전송료가 원인이라는 걸 어떻게 특정했나요?**

Data Transfer $865가 리다이렉트 응답량 추산과 안 맞았다. Cost Explorer를 USAGE_TYPE으로 나누니 인터넷 egress $632와 Regional 23TB($233)였고, Regional은 트래픽으로 설명이 안 됐다. 레거시 배치를 보니 WAS·RDS는 2a인데 ElastiCache가 2b·2c라 클릭마다 XADD와 캐시 조회가 AZ를 넘고 양방향 과금됐다. CloudWatch 캐시 트래픽 월 10.2TB × 2가 청구량과 일치했다.

후속 "나머지 egress는요?"에는 포스트백 재시도가 유력하지만 미규명이라고 답한다.

**Q. 단일 AZ로 몰면 가용성은요?**

AZ 장애 시 전체 중단이다. 그런데 RDS가 원래 Single-AZ라 앱을 여러 AZ에 둬도 못 견뎠다. 살아남지 못할 시나리오에 전송료를 내고 있던 셈이다. Valkey는 primary·replica를 같은 AZ에 두어 노드 장애 페일오버만 유지했다. ALB는 cross-zone이 무료라 2AZ 그대로, NLB는 유료라 단일 AZ에 cross-zone을 껐다. 대가는 그 AZ의 Spot이 마르면 증설이 온디맨드에 의존한다는 점이다.

근거 `modules/database/main.tf` multi_az = false, `modules/cache/main.tf` preferred_cache_cluster_azs

**Q. NLB로 바꾸면서 잃은 것은요?**

비용과 적합성은 0절 ALB와 NLB 참고. 잃은 것은 넷이다. 경로를 못 봐서 앱이 진입 포트로 가른다. XFF가 없어 trust proxy를 끄고 `preserve_client_ip`로 IP를 보존한다. WAF를 못 붙인다. 보안그룹은 생성 시점에만 지정된다.

"왜 80 평문인가요?"에는 매체에 배포된 링크가 `http://api.<도메인>/tracking`이라 못 바꾸고, HTTPS 리다이렉트를 끼우면 클릭당 왕복이 두 배라고 답한다. 한 호스트명은 LB 하나만 가리키므로 어드민만 `admin-api.`로 옮겼다.

근거 `main.ts` TRACKING_PUBLIC_PATHS, README "트래킹은 ALB가 아니라 NLB"

**Q. Spot 회수 시 클릭 유실은요?**

온디맨드 base 1대는 회수되지 않고 증설분만 Spot이다. 회수 시 2분 예고와 LB draining이 있다. 클릭은 XADD 후 응답하므로 태스크가 죽어도 큐잉된 클릭은 남는다. 컨슈머는 SIGTERM에서 in-flight 배치를 마치고 종료하고, 그 전에 죽은 배치는 PEL에 남아 XAUTOCLAIM으로 회수된다. 오토스케일링은 CPU 60%, 2~10대이며 Node가 싱글 스레드라 태스크당 1 vCPU다. Graviton은 x86 대비 약 20% 저렴하고 이미지는 arm64로 빌드한다.

근거 `modules/backend/main.tf` capacity_provider_strategy, `main.ts` enableShutdownHooks

**Q. NAT Gateway를 없애면 아웃바운드는요?**

Fargate를 public subnet에 public IP로 두고 SG로 인바운드를 막았다. RDS·Valkey만 private다. 월 약 $37 절감이다. SG 체인은 `alb(80,443)→app(3001)`, `nlb(80)→app(3002)`, app에서만 rds·redis다. 시크릿은 SSM에서 주입되고 S3·SES는 task role이라 정적 키가 없다.

**Q. RDS 다운사이징 근거는요?**

레거시 xlarge급 $373 대비 실측이 CPU 3.3%, ReadIOPS 50~90, 커넥션 60이었다. db.t4g.medium은 베이스라인 0.4 vCPU, gp3 3,000 IOPS, max_connections 약 450이라 세 축 모두 여유가 크다. 미검증 축은 메모리뿐이라 워킹셋 3GB 초과 시 large로 올리는 조건을 tfvars에 열어 뒀다. t4g는 unlimited 모드라 크레딧을 모니터링한다.

### 트래킹 핫패스

**Q. 1,160 RPS는 평균인데 피크는요?**

설계는 피크 3배를 가정했고 컷오버 후 실유입은 700~1,100/s였다. 수신은 302와 XADD뿐이라 태스크 CPU로 스케일하고, 집계는 컨슈머가 배치로 처리해 수신과 DB 쓰기 속도가 분리된다. MAXLEN이 피크 3배에서도 약 10분 분량이라 그만큼 뒤처져도 유실이 없다.

**Q. 왜 Redis Stream consumer group으로 수신·집계를 분리했나요?**

클릭마다 DB 쓰기를 하면 초당 1,000건 이상의 UPDATE가 되고 DB 장애가 곧 클릭 유실이다. 스트림을 두면 수신은 XADD 한 번이고, 컨슈머가 같은 view_code를 메모리에서 합쳐 배치당 upsert 한 문장으로 쓴다. 5,000건을 읽으면 daily_report 행은 약 750개다. consumer group은 여러 태스크가 나눠 읽고 실패 시 PEL로 재전달받기 위해서다. 명령과 linger는 0절 참고.

"Kafka·SQS는요?"에는 캐시용 Valkey가 이미 있어 추가 비용이 0이고, SQS는 배치 상한이 10이라 이 집계 방식에 맞지 않는다고 답한다.

**Q. 컨슈머 사이클이 10~20초였던 문제는요?** (관측 가능성 이야기라 꼭 준비)

핸들러는 90ms였는데 사이클이 10~20초였고 앱 CPU·DB·Redis 어디에도 흔적이 없었다. 원인은 tracking과 postback 스트림이 ioredis 연결 하나를 공유한 것이다. ioredis는 명령을 연결 단위 큐로 보내므로 유입 없는 postback의 BLOCK 5초가 끝날 때까지 tracking 읽기가 뒤에서 기다렸다. 스트림마다 `duplicate()`로 연결을 분리해 해결했다. 대기가 클라이언트 쪽이라 서버 지표에 안 남는다는 점을 짚는다.

근거 `src/infra/CLAUDE.md` "Redis 연결 분리"

**Q. 컨슈머 간 데드락은 왜 났고 정렬로 어떻게 해결되나요?**

daily_report는 view_code·날짜가 키인 집계 테이블이고, 여러 컨슈머가 같은 행들을 `INSERT ... ON CONFLICT DO UPDATE` 한 문장으로 갱신한다. 행 잠금은 VALUES 순서대로 잡히므로 A가 (x, y), B가 (y, x)면 순환 대기다. PostgreSQL이 한쪽을 죽이고 그 배치는 재전달되는데, 반복되면 전달 횟수 초과로 정상 클릭까지 폐기된다. 모든 문장이 view_code, created_date 순으로 정렬해 잠그면 순환이 생길 수 없다.

"정렬해도 데드락이 나는 경우는요?"에는 같은 트랜잭션에서 다른 테이블을 건드리거나 유니크 인덱스 잠금 순서가 다른 경우가 있지만 여기서는 트랜잭션이 이 한 문장뿐이라고 답한다.

근거 `modules/tracking/infrastructure/prisma-daily-report.repository.ts:17-20`

**Q. at-least-once면 재전달 시 중복 집계가 되지 않나요?** (가장 날카로운 질문)

맞다. 창이 있다. 핸들러 성공 시에만 XACK하므로 DB 커밋 뒤 XACK 전에 프로세스가 죽으면 60초 뒤 XAUTOCLAIM으로 한 번 더 더해진다. daily_report는 `click = click + N` 누산이라 멱등하지 않다. 감수한 이유는 창이 밀리초 단위이고 조건이 그 순간의 강제 종료뿐이며 영향이 한 배치 최대 5,000클릭의 일별 카운트 중복이라는 점이다. ack를 먼저 하면 처리 실패 시 유실이고, 정산에서는 중복보다 유실이 나쁘다.

더 나은 답은 메시지 ID 범위를 daily_report와 같은 트랜잭션에 기록해 재전달 시 건너뛰는 방식이다. 배치마다 쓰기가 늘고 테이블 관리가 필요해 현재 규모에서는 안 했다.

근거 `infra/CLAUDE.md` StreamConsumer 세부, STREAM_CLAIM_MIN_IDLE_MS_DEFAULT = 60,000, STREAM_MAX_DELIVERIES = 3

**Q. MAXLEN을 86초에서 29분으로 재산정했다는 뜻은요?**

XACK은 엔트리를 지우지 않아 `MAXLEN ~`로 상한을 건다. 트림은 소비 여부와 무관해서 상한이 곧 컨슈머가 뒤처져도 되는 시간이다. 기본값 10만은 86초분이라 배포로 컨슈머가 1~2분 멈추면 미소비 클릭이 조용히 잘린다.

| MAXLEN | 평균 1,157/s | 피크 3배 | 메모리 |
|---|---|---|---|
| 100,000 | ~86초 | ~29초 | ~15MB |
| 2,000,000 | ~29분 | ~10분 | ~300MB |

cache.t4g.medium 3.1GB 안에서 여유가 있고 메모리 사용률 알람이 한계선이다.

근거 README "REDIS_STREAM_MAXLEN 200만", `envs/prod/variables.tf` redis_stream_maxlen

**Q. 캐시 보관 기간과 신선도를 분리했다는 게 무슨 뜻인가요?**

TTL이 곧 신선도면 만료 순간 키가 사라져 그때 DB가 죽어 있으면 기댈 값이 없다. RDS가 Single-AZ라 그 시간이 곧 클릭 유실이다. 그래서 Valkey 보관은 24시간, `fresh_until`은 30분으로 분리했다. 신선하면 그대로 쓰고, 지났으면 DB에서 갱신하되 실패하면 만료 스냅샷이라도 내보낸다. 실패 후 30초는 재시도하지 않아 죽어가는 DB에 연결이 몰리는 걸 막는다. 캐시가 서킷 브레이커 역할이다.

**[직접 확인할 것]** 캠페인 수정 시 캐시 무효화 여부. "30분 안에 캠페인이 비활성화되면요?"가 온다.

근거 `modules/tracking/application/tracking.use-case.ts` 상단 상수 주석

**Q. 클릭당 80바이트 절감이 의미 있는 숫자인가요?**

일 1억 클릭이면 하루 8GB, 월 240GB egress다. 뺀 것은 넷이다.

- `res.redirect()`가 붙이는 "Found. Redirecting to..." HTML 바디. `writeHead(302)`로 헤더만 보낸다.
- Content-Length 생략 시 chunked 종결자 14바이트. 0을 명시했다.
- 전역 CORS 시 Origin 없는 요청에도 붙던 ACAO+Vary 66바이트. 트래킹 포트는 `origin: false`다.
- X-Powered-By 헤더.

같은 이유로 클릭당 로그를 남기지 않는다. CloudWatch에 한 줄이면 월 $400 이상이다.

근거 `tracking.controller.ts` 핸들러 주석, `main.ts` enableCors 주석

**Q. 트래킹에 rate limit이 없는 이유는요?**

있었는데 뺐다. @nestjs/throttler 기본 인메모리 저장소는 키를 지우지 않는데 키가 IP라 카디널리티가 무한이고, 요청마다 setTimeout을 만들고 만료 시 배열 전체를 filter해 요청량 제곱으로 나빠진다. 태스크별 인메모리라 실효 한도가 태스크 수만큼 곱해져 방어력도 약했다. 대신 Valkey 키 하나로 `open`/`half`/`closed`를 바꾸는 점검·긴급 차단 스위치를 뒀고 차단은 503이다. 500이면 트래커·모니터링이 서버 고장으로 오인한다. 되살린다면 Valkey 기반 공유 저장소여야 한다.

근거 `tracking.controller.ts` 클래스 주석, `docs/tracking-mode/plan.md`

### 레거시 MySQL → PostgreSQL 이관

DB 이관 작업물은 gitignore된 로컬 폴더라 저장소에서 검증하지 못했다. 숫자와 세부는 본인 기록으로 채운다.

**Q. 이기종 이관에서 가장 어려웠던 건요?**

스키마 자체가 달라진 게 컸다. 레거시는 TypeORM에 camelCase, 신규는 Prisma에 snake_case다. user.password가 VarChar(20)이라 어떤 표준 해시도 못 담았고 bcrypt 60자로 통일했다. Role의 MEDIA·ADVERTISER는 로그인 즉시 튕기던 죽은 값이라 USER로 내렸다. PostgreSQL은 `ALTER TYPE ... DROP VALUE`가 없어 enum은 DROP DEFAULT → ALTER TYPE USING → RENAME → SET DEFAULT 순서를 손으로 썼다.

**[직접 채울 것]** postback·daily_report 같은 대용량 테이블의 이관 방법과 소요 시간.

근거 `docs/migration/context-notes.md` D1

**Q. 제약 위반 사전 정리는 뭘 했나요?**

후보는 FK 고아 행(daily_report.token → campaign.token), MySQL zero date와 NOT NULL의 빈 문자열, 복합 unique(`campaign_config[campaign_id, admin_event_name]`) 중복, 길이 제약이다. 캠페인명·예약명을 50자로 확대한 커밋이 있으니 레거시 데이터 길이가 이유였는지 확인한다.

**[직접 채울 것]** 실제 걸린 항목·건수와 처리 방식.

**Q. 한글 인코딩 깨짐의 원인과 정제는요?**

가장 흔한 원인은 이중 인코딩이다. 커넥션 문자셋이 latin1인 채로 UTF-8 바이트를 넣은 경우로, latin1로 읽어 UTF-8로 재해석하면 복원된다. `?`로 치환된 진짜 손실은 원본에서 다시 받아야 한다.

**[직접 채울 것]** 어느 유형·어느 컬럼이었는지, 검증을 샘플 대조로 했는지 전수로 했는지.

**Q. "Claude Code 기반 AST 스크립트"는 뭘 자동화했나요?**

MySQL 덤프 DDL을 정규식으로 바꾸면 문자열 안의 우연한 매칭을 놓친다. SQL 파서로 AST를 만들어 백틱 제거, `tinyint(1)`→boolean, datetime→timestamp, AUTO_INCREMENT→identity, ENGINE·CHARSET 제거를 노드 단위로 변환하고, 변환 안 된 노드를 목록으로 뽑아 검토했다. 스크립트는 Claude Code로 작성했고 변환 규칙과 검증 쿼리는 내가 정했다.

**[직접 채울 것]** 사용한 파서, 변환 후 검증(테이블별 count·checksum 대조 등).

**Q. DNS 컷오버 게이트와 유실 방지는요?**

2026-09-03 23:19 KST에 컷오버했고 유입은 700~1,100/s였다. 트래킹 URL은 못 바꾸므로 DNS만 바꾼다. 전파 동안 두 스택이 동시에 클릭을 받으므로 그 기간의 집계 병합이 핵심이다. 게이트는 신규 스택의 302 정상, 포스트백 도착, 컨슈머 지연 0, DNS 되돌리기만으로 롤백 가능 여부다. 레거시 정리는 09-05라 이틀간 롤백 여지를 남겼다.

**[직접 채울 것]** DNS TTL, 병행 수신 기간의 daily_report 병합 방법, 레거시 최종 동기화 시점.

근거 `infra/terraform/README.md` 현재 상태

### 아키텍처

**Q. 이 규모에 클린 아키텍처 4계층은 과하지 않나요?**

두 군데 절충했다. domain은 Prisma를 모르되 entity를 interface로 두고 필드명을 DB 컬럼과 같은 snake_case로 맞춰서, Prisma row가 구조적으로 호환되면 재포장 없이 반환한다. use-case는 repository 인터페이스와 심볼 토큰으로만 의존해 DB 없이 `jest.fn()`으로 테스트가 끝난다. 얻은 것은 12개 모듈이 같은 규약을 따라 이관 절차가 5단계 체크리스트로 고정됐다는 점이다.

**Q. anti-corruption layer를 왜 class-transformer로 했나요?**

트래커마다 같은 값을 다른 파라미터명·시간 포맷으로 보낸다. 이 차이가 use-case에 새면 트래커가 늘 때마다 비즈니스 로직에 분기가 생긴다. 트래커별 폴더에 tracking·install·event mapper 3개를 두고 `@Expose({ name })`과 `@Transform`으로 표준 필드로 정규화한다. 바깥에는 `TRACKERS[name].install(query)` 순수 함수로만 노출한다. 새 트래커는 폴더 하나와 레지스트리 한 줄이면 `@IsIn(TRACKER_NAMES)` 검증과 라우팅이 자동으로 붙는다.

"핫패스에서 느리지 않나요?"에는 포스트백은 클릭보다 두 자릿수 적고 병목은 항상 DB 왕복이었다고 답한다.

**Q. 인증·인가 설계는요?**

전역 APP_GUARD 두 개이고 RolesGuard는 strict라 `@Roles`도 `@Public`도 없으면 403이다. 새 컨트롤러가 조용히 열리는 것보다 조용히 막히는 쪽을 택했다. passport는 헤더 파싱 3줄을 얻으려고 의존성 3개를 붙이는 셈이라 @nestjs/jwt만 쓴다. 역할은 USER ⊂ ADMIN ⊂ DEVELOPER이고 별도로 USER는 연결된 광고만 본다. 면제 판정은 한 함수에서만 하고 빈 스코프는 "아무것도 못 봄"이다. 스코프 위반에 403을 쓰지 않는 이유는 프론트가 403을 세션 만료로 보고 로그아웃시키기 때문이라 목록은 빈 배열, 단건은 404다.

근거 `modules/CLAUDE.md` 인증·인가, 광고 스코프

**Q. 커버리지 90% 강제가 의미 없는 테스트를 만들지 않나요?**

백엔드는 modules/ 전체에 걸고 DI 배선뿐인 *.module.ts만 제외했다. 프론트는 antd·react-table 의존 화면까지 넣으면 불가능해서 순수 로직 파일(셀 계산·합계·인증 헬퍼·엑셀 워크북·API 응답 매퍼)로 한정했다. 숫자보다 무엇을 테스트하기로 정했는지가 핵심이다. `_sum.x ?? 0` 매핑 12개가 두 메서드에 중복돼 branch가 46%까지 떨어졌는데, 함수 하나로 추출하니 케이스 두 개로 100%가 되고 코드도 짧아졌다.

근거 `apps/frontend/CLAUDE.md` 커버리지 기준, `docs/migration/context-notes.md` 6단계 교훈

**Q. GitHub Actions 구성은요?**

Terraform 구성은 0절 참고. Actions는 main push 시 backend는 arm64 이미지 빌드 후 ECS 배포, frontend는 S3 sync 후 CloudFront 무효화이고 둘 다 OIDC라 정적 키가 없다.

**[직접 채울 것]** Prisma migrate deploy를 언제 어디서 돌리는지, 실패 시 배포를 막는지.

### Claude Code 활용

**Q. CLAUDE.md로 컨벤션을 유도했다는 게 구체적으로요?**

디렉터리마다 CLAUDE.md를 두고 규칙과 이유를 적었다. 4계층 의존 방향, "domain은 Prisma를 모른다", 심볼 토큰 패턴, 데코레이터 의무, 403을 안 쓰는 이유 같은 것이다. 이유를 적어야 에이전트가 경계 사례에서 규칙을 우회하지 않고, 사람에게는 온보딩 문서가 된다. 구조적으로도 막았다. RolesGuard가 strict라 누락이 403으로 드러나고, 커버리지 임계가 CI에서 실패한다.

**Q. AI가 쓴 테스트가 실제로 결함을 잡은 사례는요?**

후보 셋이다.

- advertising 컨트롤러에서 `:id`가 정적 경로보다 먼저 선언돼 `/list`·`/dashboard`를 잡아먹던 레거시 잠재 버그.
- 레거시 JwtStrategy의 `ignoreExpriration` 오타로 만료 검증이 꺼져 있던 것.
- 302 슬림화 커밋이 throttler 데코레이터를 함께 지웠는데 e2e가 rootDir 밖이라 가려져 있던 것.

**[직접 채울 것]** 셋 중 테스트가 먼저 잡은 게 무엇인지. 사람이 발견한 것을 테스트가 잡았다고 말하지 않는다.

**Q. Claude Code 없이도 같은 결과를 낼 수 있었나요? 어디까지 맡겼나요?**

맡긴 것은 규약이 명확한 반복 작업이다. 도메인 이관 5단계 반복, 커버리지용 엣지 케이스 spec, DDL 변환 스크립트, 문서 갱신이다. 직접 한 것은 결정과 진단이다. 비용 구조 분석과 단일 AZ, NLB 전환, 컨슈머 사이클 원인 추적, 데드락 해법, MAXLEN 재산정, 캐시 신선도 분리다. 2026-07-10 하루에 인증·advertiser·media·tracker·campaign·advertising 여섯 단계를 각각 4지표 100%로 끝냈다. 에이전트의 결정은 맥락 메모에 남겨 다음 세션이 추론을 반복하지 않게 했다.

근거 `docs/migration/context-notes.md` 단계별 완료 기록

---

## 3. 먼저 꺼낼 약점

면접관이 찾기 전에 말하면 "알고 감수했다"가 되고, 찾힌 뒤면 "몰랐다"가 된다.

- **at-least-once와 누산 집계의 중복 창.** 밀리초 창, 유실보다 중복이 낫다는 판단, 메시지 ID 기록으로 멱등화하는 다음 단계까지.
- **단일 AZ와 Spot 동시 사용.** RDS가 원래 Single-AZ였고 base 온디맨드 1대로 방어했다. 남은 위험은 그 AZ의 Spot 고갈이다.
- **트래킹에 어뷰징 방어가 없음.** NLB라 WAF도 못 붙인다. Valkey 기반 공유 rate limit이 다음 과제다.
- **API·컨슈머가 한 프로세스.** 분리 진입점은 있지만 운영은 단일 프로세스다. 수신·집계는 스트림으로 분리돼 있어 현재 규모에서는 충분하다.
- **"48%" 표현과 절감률이 추정치라는 점.** 1절 정정 참고.
- **프론트 커버리지 범위를 순수 로직으로 한정한 것.** 90%를 말할 때 범위를 함께 말한다.
