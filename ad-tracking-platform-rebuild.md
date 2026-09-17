# 광고 트래킹 플랫폼 재구축

이력서 항목별로 면접관이 파고들 질문을 뽑고, 저장소의 코드·주석·Terraform README를 근거로 답변을 썼다. 저장소에 없는 부분은 **[직접 채울 것]**으로 표시했다.

---

## 0. 선택한 기술 스택 정리

답변 골격은 "정의 한 줄 → 왜 골랐나 → 이 프로젝트에서 어디에 쓰였나"다.

### Valkey

Redis의 오픈소스 포크다. 2024년 Redis가 라이선스를 바꾸자 Linux Foundation 아래에서 Redis 7.2를 기반으로 갈라져 나왔고, 프로토콜과 명령이 Redis와 같아 ioredis 같은 기존 클라이언트를 그대로 쓴다. AWS ElastiCache에서는 Redis OSS 대비 약 20% 저렴하다.

이 프로젝트에서는 두 역할이다. 캠페인 스냅샷 캐시(클릭마다 token으로 조회)와 Redis Stream 메시지 큐다. 둘은 별도 ioredis 연결을 쓴다. "Redis 대신 Valkey를 쓴 이유"를 물으면 라이선스와 비용, 그리고 코드 변경 0이라고 답한다.

### Valkey(Redis) Stream

Redis 5부터 있는 append-only 로그 자료구조다. Kafka의 토픽과 비슷하되 단일 노드 안에서 동작한다.


| 명령           | 역할                                   | 이 프로젝트에서              |
| ------------ | ------------------------------------ | --------------------- |
| `XADD`       | 엔트리 추가, `MAXLEN ~`로 길이 상한            | 클릭 수신 시 view_code를 넣음 |
| `XREADGROUP` | consumer group으로 읽기, `COUNT`·`BLOCK` | 컨슈머가 5,000건씩 배치로 읽음   |
| `XACK`       | 처리 완료 표시                             | 핸들러 성공 시에만 호출         |
| `XAUTOCLAIM` | 오래 미처리(PEL)된 메시지를 다른 컨슈머가 회수         | 60초 유휴 시 재전달          |


Pub/Sub과 다른 점은 메시지가 남는다는 것이고, List와 다른 점은 consumer group으로 여러 소비자가 나눠 읽으면서 미처리 목록(PEL)으로 재전달을 보장한다는 것이다. 이 프로젝트는 "구 Kafka"를 대체했다. 캐시용 Valkey가 이미 있어 추가 인프라 비용이 0이고, 일 1억 건은 단일 노드로 충분하기 때문이다.

### Terraform

HashiCorp의 IaC(Infrastructure as Code) 도구다. HCL로 원하는 인프라 상태를 선언하면 `plan`으로 변경 diff를 보여주고 `apply`로 실제 클라우드에 반영한다. 현재 상태는 state 파일에 기록되어 콘솔에서 손으로 만든 것과 달리 재현·리뷰·롤백이 된다.

이 프로젝트에서는 network·backend·database·cache·ecr·frontend·acm·bastion 8개 모듈을 `envs/prod`에서 조립한다. state 버킷은 bootstrap으로 한 번만 만든다. 시크릿은 Terraform이 생성해 SSM에만 넣어 tfvars에 비밀이 없다. SES는 일부러 Terraform 밖에 뒀다. 레거시가 만든 도메인 identity를 소유하면 destroy 한 번에 레거시 메일까지 끊기기 때문이다.

### ALB와 NLB

둘 다 AWS Elastic Load Balancer다. ALB는 L7(HTTP)에서 동작해 경로·호스트·헤더로 라우팅하고 TLS 종료, WAF, X-Forwarded-For 부착을 한다. NLB는 L4(TCP)에서 동작해 패킷을 그대로 넘기므로 경로를 못 보고 헤더도 안 붙이지만, 훨씬 싸고 빠르다.

#### LCU(Load Balancer Capacity Unit)란

AWS 로드밸런서의 사용량 과금 단위다. LB 비용은 "시간당 고정비 + 시간당 LCU 수 × LCU 단가"로 청구되고, LCU 수는 네 차원을 각각 재서 **가장 큰 값 하나**만 쓴다. 네 차원을 더하지 않는다.

| 차원 | ALB 1 LCU 기준 | NLB 1 NLCU 기준 |
|---|---|---|
| 신규 연결 (초당) | 25 | 800 |
| 활성 연결 (분당) | 3,000 | 100,000 |
| 처리 바이트 (시간당) | 1 GB | 1 GB |
| 규칙 평가 (초당) | 1,000 | 해당 없음 |

예를 들어 초당 신규 연결 1,157개, 처리 바이트 시간당 4.2GB면 ALB는 1,157 ÷ 25 = 46 LCU와 4.2 ÷ 1 = 4.2 LCU 중 큰 46 LCU로 과금된다. NLB는 1,157 ÷ 800 = 1.4 NLCU와 4.2 NLCU 중 큰 4.2 NLCU다. 단가는 서울 리전 기준 ALB 약 $0.008/LCU·시간, NLB 약 $0.006/NLCU·시간이라 월(730시간)로 환산하면 ALB 약 $270, NLB 약 $20~35다.

핵심은 "어느 차원이 최댓값이 되느냐"가 트래픽 성격에 따라 달라진다는 점이다. 롱폴링이나 웹소켓처럼 연결을 오래 유지하면 활성 연결이, 대용량 다운로드면 처리 바이트가 지배한다. 클릭 트래킹은 302 한 번 받고 끊는 짧은 연결이 초당 1,000개 이상 생기므로 신규 연결 차원이 홀로 지배하고, 이 차원의 기준값이 ALB와 NLB 사이에 32배(25 vs 800) 차이가 난다. 같은 트래픽이라도 처리 바이트가 지배하는 서비스였다면 두 LB의 LCU 비용은 거의 같았을 것이다.

면접에서 "LCU가 뭔가요?"라고 물으면 한 문장으로 답한다. "네 가지 사용량 차원 중 최댓값으로 청구되는 LB 용량 단위이고, 우리 트래픽은 신규 연결이 지배해서 그 기준값이 32배 유리한 NLB로 옮겼습니다."

그래서 진입점을 둘로 나눴다. 매체에 배포된 트래킹 링크는 NLB 80 포트, 어드민 API는 ALB HTTPS다. 태스크 하나가 3001·3002를 모두 열고, NLB로 들어온 3002에서는 앱이 공개 경로 4개만 통과시킨다. NLB의 대가는 WAF 불가, XFF 없음, 경로 필터링을 앱이 대신하는 것이다.

### SES (Simple Email Service)

AWS의 메일 발송 서비스다. 도메인 identity와 DKIM을 등록하면 API로 메일을 보낸다. 건당 과금이라 SMTP 서버를 직접 운영하는 것보다 싸고, 스팸 평판 관리를 AWS가 한다.

이 프로젝트에서는 회원가입 인증 코드 발송에 쓴다. `infra/mail`의 `SesMailAdapter`가 `MailPort` 뒤에 있고, 자격 증명은 ECS task role의 `ses:SendEmail` 권한으로 처리해 정적 키가 없다.

### SSM (Systems Manager) Parameter Store

AWS의 설정·시크릿 저장소다. `SecureString` 타입은 KMS로 암호화되고 표준 파라미터는 무료다. Secrets Manager가 비밀당 월 $0.40인 것과 비교된다.

이 프로젝트에서는 DB 비밀번호와 JWT 시크릿을 Terraform이 생성해 SSM에만 저장하고, ECS task definition의 `secrets` 필드로 컨테이너 환경변수에 주입한다. tfvars·코드·이미지 어디에도 비밀이 없고, execution role에만 읽기 권한이 있다.

### Turborepo

모노레포 빌드 오케스트레이터다. `turbo.json`에 태스크 간 의존(`dependsOn: ["^build"]`)을 선언하면 워크스페이스 그래프 순서대로 병렬 실행하고, 입력 파일 해시로 결과를 캐시해 바뀌지 않은 패키지는 건너뛴다.

이 프로젝트에서는 `apps/backend`·`apps/frontend`·`packages/*`에 대해 build·lint·check-types·test·dev를 루트에서 한 번에 돌린다. 공유 ESLint·tsconfig 패키지가 먼저 빌드되는 순서를 turbo가 보장한다.

### pnpm과 npm의 차이


|                 | npm                             | pnpm                                     |
| --------------- | ------------------------------- | ---------------------------------------- |
| 저장 방식           | 프로젝트마다 node_modules에 복사         | 전역 store에 한 번 저장, hard link              |
| node_modules 구조 | flat(hoisting)                  | 심볼릭 링크 기반 nested                         |
| 디스크·설치 속도       | 프로젝트 수만큼 중복                     | 중복 없음, 대체로 더 빠름                          |
| 유령 의존성          | package.json에 없는 패키지도 import 가능 | 선언한 것만 접근 가능                             |
| 워크스페이스          | 지원                              | `pnpm-workspace.yaml`, `--filter`로 개별 실행 |


모노레포에서 pnpm을 고른 이유는 엄격한 의존성 격리와 워크스페이스 필터다. `pnpm --filter backend run deploy` 같은 루트 래퍼가 그 예다. npm의 hoisting은 어떤 앱이 다른 앱의 의존성을 우연히 쓰는 문제를 만드는데, pnpm은 선언하지 않으면 import 자체가 실패한다.

스택 질문에서 가장 자주 이어지는 후속은 "Redis Stream 대신 Kafka·SQS를 안 쓴 이유"와 "NLB로 가면서 잃은 것"이다. 둘 다 아래 답변에 있다.

---

## 1. 먼저 고칠 것

이력서는 "전체 청구액의 48%였던 AZ 간 전송료를 0으로"라고 썼다. Terraform README의 2026-07 청구서 분석은 다르다.


| 항목                         | 금액   | 비중           |
| -------------------------- | ---- | ------------ |
| Data Transfer 전체           | $865 | 48%          |
| 그중 AZ 간 전송(Regional-Bytes) | $233 | 약 13%        |
| 그중 인터넷 egress(Out-Bytes)   | $632 | 단일 AZ로 안 줄어듦 |


면접관이 Cost Explorer 항목명을 물으면 바로 드러난다. "전송료 48% 중 AZ 간 전송 $233을 0으로"로 고친다. "40~55% 절감"도 설계 시점 추정치다. 컷오버 후 실청구액을 확인해 두면 가장 강한 답이 된다.

---

## 2. 예상 질문과 답변

### AWS 비용 최적화

**Q. AZ 간 전송료가 원인이라는 걸 어떻게 특정했나요?**

청구서의 Data Transfer $865가 리다이렉트 응답량 추산과 맞지 않았다. Cost Explorer를 USAGE_TYPE으로 나누니 인터넷 egress 5,118GB($632)와 Regional 23,283GB($233) 두 줄이었다. Regional 23TB는 트래픽으로 설명이 안 됐고, 레거시 배치를 보니 WAS·RDS는 2a인데 ElastiCache 두 노드가 2b·2c에 있었다. 클릭마다 XADD와 캐시 조회가 AZ를 넘고 양방향 과금된다. CloudWatch 캐시 트래픽 월 10.2TB × 2가 청구량과 일치했고 5~8월 내내$216~271로 일관됐다.

후속 "나머지 egress 2~3TB는요?"에는 포스트백 발신 재시도가 유력하지만 미규명이라고 솔직히 답한다.

**Q. 단일 AZ로 몰면 가용성은요?**

AZ 장애 시 전체 중단이다. 그런데 RDS가 원래 Single-AZ라 앱을 여러 AZ에 두어도 AZ 장애를 못 견뎠다. 살아남지 못할 시나리오에 전송료를 내고 있던 셈이다. Valkey는 primary와 replica를 같은 AZ에 두어 노드 장애 페일오버는 유지하고 AZ 장애 대비만 포기했다. ALB는 2AZ 필수지만 cross-zone 전송이 무료라 비용 영향이 없고, NLB는 유료라 단일 AZ에 두고 cross-zone을 껐다. 대가는 그 AZ의 Spot 용량이 마르면 증설이 온디맨드에 의존한다는 점이다.

근거 `infra/terraform/modules/database/main.tf` multi_az = false, `modules/cache/main.tf` preferred_cache_cluster_azs

**Q. NLB로 바꾸면 LB 비용이 1/8이 된다는 계산은요?**

LCU는 신규 연결·활성 연결·처리 바이트·규칙 평가 중 최댓값 하나로 과금된다. 클릭은 302 한 번 받고 끊는 일회성 연결이라 신규 연결 차원이 지배한다.


|     | 신규 연결 기준       | 1,157/s일 때 | 월 비용  |
| --- | -------------- | ---------- | ----- |
| ALB | 25/s per LCU   | 46 LCU     | ~$270 |
| NLB | 800/s per NLCU | 1.4 NLCU   | ~$35  |


NLB에서는 신규 연결이 1.4로 내려가 처리 바이트 4.2 NLCU가 최댓값이 된다.

잃은 것도 말한다. L4라 경로를 못 봐서 앱이 진입 포트로 가른다. 3002(NLB)에서는 `/tracking`, `/*/install`, `/*/event`, `/health`만 통과시키고 나머지는 404다. X-Forwarded-For가 없어 trust proxy를 끄고 `preserve_client_ip`로 실제 IP를 보존한다. WAF를 못 붙인다. NLB의 보안그룹은 생성 시점에만 지정할 수 있다.

"왜 80 평문인가요?"에는 매체에 배포된 링크가 `http://api.<도메인>/tracking`이라 못 바꾸고, HTTPS 리다이렉트를 끼우면 클릭당 왕복이 두 배라고 답한다. 한 호스트명은 LB 하나만 가리키므로 어드민만 `admin-api.`로 옮겼다.

근거 `apps/backend/src/main.ts` TRACKING_PUBLIC_PATHS, README "트래킹은 ALB가 아니라 NLB"

**Q. Spot 회수 시 클릭 유실은요?**

온디맨드 base 1대는 회수되지 않고 증설분만 Spot이다. 회수 시 2분 예고와 LB draining이 있다. 클릭은 XADD 후 응답하므로 태스크가 죽어도 큐잉된 클릭은 남는다. 컨슈머는 SIGTERM에서 in-flight 배치를 마치고 종료하고, 성공 전에 죽은 배치는 PEL에 남아 XAUTOCLAIM으로 다른 컨슈머가 가져간다. 오토스케일링은 CPU 60%, 2~10대이며 Node가 싱글 스레드라 태스크당 1 vCPU가 단위다. Graviton은 x86 대비 약 20% 저렴하고 이미지는 arm64로 빌드해야 한다.

근거 `modules/backend/main.tf` capacity_provider_strategy, `src/main.consumer.ts` enableShutdownHooks

**Q. NAT Gateway를 없애면 SES·매체 포스트백 같은 아웃바운드는요?**

Fargate를 public subnet에 public IP로 두고 SG로 인바운드를 막았다. RDS·Valkey만 private subnet이다. 월 약 $37 절감이다. SG 체인은 `alb(80,443)→app(3001)`, `nlb(80)→app(3002)`, app에서만 rds·redis다. 시크릿은 SSM SecureString에서 task definition secrets로 주입되고 S3·SES는 task role이라 정적 키가 없다.

**Q. RDS 다운사이징 근거는요?**

레거시 xlarge급 $373 대비 실측이 CPU 3.3%(실효 0.13 vCPU), ReadIOPS 50~90, 커넥션 60이었다. db.t4g.medium은 베이스라인 0.4 vCPU, gp3 3,000 IOPS, max_connections 약 450이라 세 축 모두 여유가 크다. 미검증 축은 메모리뿐이라 워킹셋 3GB 초과 시 large로 올리는 조건을 tfvars에 열어 뒀다. t4g는 unlimited 모드라 크레딧 소진 시 추가 과금되므로 크레딧을 모니터링한다.

### 트래킹 핫패스

**Q. 1,160 RPS는 평균인데 피크는요?**

설계는 피크 3배를 가정했고 컷오버 후 실유입은 700~1,100/s였다. 수신은 302와 XADD뿐이라 태스크 CPU로 스케일하고, 집계는 컨슈머가 배치로 처리해 수신과 DB 쓰기 속도가 분리된다. MAXLEN이 피크 3배에서도 약 10분 분량이라 그만큼 뒤처져도 유실이 없다.

**Q. 왜 Redis Stream consumer group으로 수신·집계를 분리했나요?**

클릭마다 DB 쓰기를 하면 초당 1,000건 이상의 UPDATE가 되고 DB 장애가 곧 클릭 유실이다. 스트림을 두면 수신은 XADD 한 번이고, 컨슈머가 같은 view_code를 메모리에서 합쳐 배치당 upsert 한 문장으로 쓴다. 5,000건을 읽으면 실측 daily_report 행은 약 750개다. consumer group은 여러 태스크가 나눠 읽고 실패 시 PEL로 재전달받기 위해서다.

"Kafka·SQS는요?"에는 캐시용 Valkey가 이미 있어 추가 비용이 0이고, SQS는 배치 상한이 10이라 이 집계 방식에 맞지 않는다고 답한다.

**Q. linger 배치가 뭐고 1/20은 어떻게 측정했나요?**

XREADGROUP은 1건만 도착해도 즉시 반환해서 COUNT 5,000을 잡아도 배치가 사실상 안 채워진다. 첫 읽기가 COUNT를 못 채우면 200ms 기다렸다 논블로킹으로 한 번 더 읽어 합친다. 초당 문장 수는 대략 컨슈머 수 ÷ (linger + DB 왕복)이고, 비용은 집계 지연 200ms뿐이다. READ_COUNT를 1,000에서 5,000으로 올린 근거는 750행 × 17컬럼 = 바인드 파라미터 12,750개로 PostgreSQL 상한 65,535에 여유가 크고 핸들러가 약 450ms였다는 점이다.

**[직접 채울 것]** 1/20의 측정 방법. 컨슈머 로그의 배치당 메시지 수인지, RDS의 초당 DML 문장 수인지.

근거 `redis-stream.constants.ts` STREAM_READ_COUNT·STREAM_LINGER_MS_DEFAULT 주석

**Q. 컨슈머 사이클이 10~20초였던 문제는요?** (관측 가능성 이야기라 꼭 준비)

실제 핸들러는 90ms였는데 사이클이 10~20초였고, 앱 CPU·DB·Redis 어디에도 흔적이 없었다. 원인은 tracking과 postback 스트림이 ioredis 연결 하나를 공유한 것이다. ioredis는 명령을 연결 단위 큐로 보내므로 유입 없는 postback의 BLOCK 5초가 끝날 때까지 tracking 읽기가 뒤에서 기다렸다. 스트림마다 `duplicate()`로 연결을 분리해 해결했고, 캐시 연결과 스트림 연결도 같은 이유로 분리했다. 대기가 클라이언트 쪽이라 서버 지표에 안 남는다는 점을 짚는다.

근거 `apps/backend/src/infra/CLAUDE.md` "Redis 연결 분리"

**Q. 컨슈머 간 데드락은 왜 났고 정렬로 어떻게 해결되나요?**

daily_report는 view_code·날짜가 키인 집계 테이블이고, tracking·postback 컨슈머와 여러 태스크가 같은 행들을 `INSERT ... ON CONFLICT DO UPDATE` 한 문장으로 갱신한다. 행 잠금은 VALUES 순서대로 잡히므로 A가 (x, y), B가 (y, x) 순이면 순환 대기가 된다. PostgreSQL이 한쪽을 죽이고 그 배치는 재전달되는데, 반복되면 전달 횟수 초과로 정상 클릭까지 폐기된다. 모든 문장이 view_code, created_date 순으로 정렬해 잠그게 하면 순환이 생길 수 없다.

"정렬해도 데드락이 나는 경우는요?"에는 같은 트랜잭션에서 다른 테이블을 건드리거나 유니크 인덱스 잠금 순서가 다른 경우가 있지만 여기서는 트랜잭션이 이 한 문장뿐이라고 답한다.

근거 `modules/tracking/infrastructure/prisma-daily-report.repository.ts:17-20`

**Q. at-least-once면 재전달 시 중복 집계가 되지 않나요?** (가장 날카로운 질문)

맞다. 창이 있다. 핸들러 성공 시에만 XACK하므로 DB 커밋 뒤 XACK 전에 프로세스가 죽으면 60초 뒤 XAUTOCLAIM으로 한 번 더 더해진다. daily_report는 `click = click + N` 누산이라 멱등하지 않다. 감수한 이유는 창이 밀리초 단위이고, 조건이 그 순간의 강제 종료뿐이며, 영향이 한 배치 최대 5,000클릭의 일별 카운트 중복이라는 점이다. 반대로 ack를 먼저 하면 처리 실패 시 유실이고, 정산에서는 중복보다 유실이 나쁘다.

더 나은 답을 물으면 메시지 ID 범위를 daily_report와 같은 트랜잭션에 기록해 재전달 시 건너뛰는 방식이 있지만 배치마다 쓰기가 늘고 테이블 관리가 필요해 현재 규모에서는 안 했다고 답한다.

근거 `infra/CLAUDE.md` StreamConsumer 세부, STREAM_CLAIM_MIN_IDLE_MS_DEFAULT = 60,000, STREAM_MAX_DELIVERIES = 3

**Q. MAXLEN을 86초에서 29분으로 재산정했다는 뜻은요?**

XACK은 엔트리를 지우지 않아 `MAXLEN ~`로 상한을 건다. 이 트림은 소비 여부와 무관해서 상한이 곧 컨슈머가 뒤처져도 되는 시간이다. 앱 기본값 10만은 86초분이라 배포로 컨슈머가 1~2분 멈추거나 RDS가 잠깐 아프면 미소비 클릭이 조용히 잘린다.


| MAXLEN    | 평균 1,157/s | 피크 3배 | 메모리    |
| --------- | ---------- | ----- | ------ |
| 100,000   | ~86초       | ~29초  | ~15MB  |
| 2,000,000 | ~29분       | ~10분  | ~300MB |


cache.t4g.medium 3.1GB 안에서 여유가 있고 메모리 사용률 알람이 한계선이다.

근거 README "REDIS_STREAM_MAXLEN 200만", `envs/prod/variables.tf` redis_stream_maxlen

**Q. 캐시 보관 기간과 신선도를 분리했다는 게 무슨 뜻인가요?**

TTL이 곧 신선도면 만료 순간 키가 사라져 그때 DB가 죽어 있으면 기댈 값이 없다. RDS가 Single-AZ라 그 시간이 곧 클릭 유실이다. 그래서 Valkey 보관은 24시간, `fresh_until`은 30분으로 분리했다. 신선하면 그대로 쓰고, 지났으면 DB에서 갱신하되 실패하면 만료 스냅샷이라도 내보낸다. 구 URL로 보내는 편이 아무것도 못 보내는 것보다 낫다. 실패 후 30초는 재시도하지 않아 죽어가는 DB에 연결 시도가 몰려 복구를 방해하는 걸 막는다. 캐시가 서킷 브레이커 역할이다.

**[직접 확인할 것]** 캠페인 수정 시 캐시 무효화 여부. "30분 안에 캠페인이 비활성화되면요?"가 온다.

근거 `modules/tracking/application/tracking.use-case.ts` 상단 상수 주석

**Q. 클릭당 80바이트 절감이 의미 있는 숫자인가요?**

일 1억 클릭이면 하루 8GB, 월 240GB egress다. 뺀 것은 네 가지다.

- `res.redirect()`가 붙이는 "Found. Redirecting to..." HTML 바디. `writeHead(302)`로 헤더만 보낸다.
- Content-Length 생략 시 Node가 chunked로 내보내며 붙는 종결자 14바이트. 0을 명시했다.
- 전역 CORS 시 Origin 없는 요청에도 붙던 ACAO+Vary 66바이트. 트래킹 포트는 `origin: false`다. 브라우저 top-level 리다이렉트라 CORS가 무의미하다.
- X-Powered-By 헤더.

같은 이유로 클릭당 로그를 남기지 않는다. CloudWatch에 한 줄이면 월 $400 이상이다.

근거 `tracking.controller.ts` 핸들러 주석, `main.ts` enableCors 주석

**Q. 트래킹에 rate limit이 없는 이유는요?**

있었는데 뺐다. @nestjs/throttler 기본 인메모리 저장소는 키를 지우지 않는데 키가 IP라 카디널리티가 무한이라 메모리를 계속 먹고, 요청마다 setTimeout을 만들고 만료 시 배열 전체를 filter해 요청량 제곱으로 나빠진다. 태스크별 인메모리라 실효 한도가 태스크 수만큼 곱해져 방어력도 약했다. 대신 Valkey 키 하나로 `open`/`half`/`closed`를 바꾸는 점검·긴급 차단 스위치를 뒀고 차단은 503이다. 500이면 트래커·모니터링이 서버 고장으로 오인한다. 이건 어뷰징 방어가 아니며, 되살린다면 Valkey 기반 공유 저장소여야 한다.

근거 `tracking.controller.ts` 클래스 주석, `docs/tracking-mode/plan.md`

### 레거시 MySQL → PostgreSQL 이관

DB 이관 작업물은 gitignore된 로컬 폴더라 저장소에서 검증하지 못했다. 골격만 있으니 숫자와 세부는 본인 기록으로 채운다.

**Q. 이기종 이관에서 가장 어려웠던 건요?**

스키마 자체가 달라진 게 컸다. 레거시는 TypeORM 평면 모듈에 camelCase, 신규는 Prisma에 snake_case다. user의 password가 VarChar(20)에 salt는 선언만 있어 어떤 표준 해시도 못 담았고, bcrypt 60자로 통일했다. Role의 MEDIA·ADVERTISER는 프론트에서 로그인 즉시 튕기던 죽은 값이라 USER로 내렸다. PostgreSQL은 `ALTER TYPE ... DROP VALUE`가 없어 enum은 DROP DEFAULT → ALTER TYPE USING → RENAME → SET DEFAULT 순서를 손으로 썼다.

**[직접 채울 것]** postback·daily_report 같은 대용량 테이블의 이관 방법과 소요 시간.

근거 `docs/migration/context-notes.md` D1, 루트 `context-notes.md` 마이그레이션 주의

**Q. 제약 위반 사전 정리는 뭘 했나요?**

후보는 FK가 걸릴 컬럼의 고아 행(daily_report.token → campaign.token), MySQL zero date와 NOT NULL의 빈 문자열, 복합 unique(`campaign_config[campaign_id, admin_event_name]`) 중복, 길이 제약이다. 캠페인명·예약명을 50자로 확대한 커밋이 있으니 레거시 데이터 길이가 이유였는지 확인한다.

**[직접 채울 것]** 실제 걸린 항목·건수와 처리 방식(삭제·보정·컬럼 확장).

**Q. 한글 인코딩 깨짐의 원인과 정제는요?**

가장 흔한 원인은 이중 인코딩이다. 커넥션 문자셋이 latin1인 채로 UTF-8 바이트를 넣은 경우로, 바이트를 latin1로 읽어 UTF-8로 재해석하면 복원된다. `?`로 치환된 진짜 손실은 복원이 안 되므로 원본에서 다시 받아야 한다.

**[직접 채울 것]** 어느 유형·어느 컬럼이었는지, 복원 검증을 샘플 대조로 했는지 전수로 했는지.

**Q. "Claude Code 기반 AST 스크립트"는 뭘 자동화했나요?**

mysqldump DDL을 정규식으로 바꾸면 문자열 안의 우연한 매칭을 놓친다. SQL 파서로 AST를 만들어 백틱 제거, `tinyint(1)`→boolean, datetime→timestamp, AUTO_INCREMENT→identity, ENGINE·CHARSET 절 제거를 노드 단위로 변환하고, 변환 안 된 노드를 목록으로 뽑아 검토했다. 스크립트는 Claude Code로 작성·수정했고 변환 규칙과 검증 쿼리는 내가 정했다.

**[직접 채울 것]** 사용한 파서, 변환 후 검증(테이블별 count·checksum 대조 등).

**Q. DNS 컷오버 게이트와 유실 방지는요?**

2026-09-03 23:19 KST에 컷오버했고 유입은 700~1,100/s였다. 트래킹 URL은 못 바꾸므로 DNS만 바꾼다. 전파 동안 두 스택이 동시에 클릭을 받으므로 그 기간의 집계 병합이 핵심이다. 게이트는 신규 스택의 302 정상 여부, 포스트백 도착, 컨슈머 지연 0, DNS 되돌리기만으로 롤백 가능 여부다. 레거시 정리는 09-05라 이틀간 롤백 여지를 남겼다.

**[직접 채울 것]** DNS TTL, 병행 수신 기간의 daily_report 병합 방법, 레거시 최종 동기화 시점.

근거 `infra/terraform/README.md` 현재 상태

### 아키텍처

**Q. 이 규모에 클린 아키텍처 4계층은 과하지 않나요?**

두 군데 절충했다. domain은 Prisma를 모르되 entity를 interface로 두고 필드명을 DB 컬럼과 같은 snake_case로 맞춰서, Prisma row가 구조적으로 호환되면 repository에서 재포장 없이 반환한다. use-case는 repository 인터페이스와 심볼 토큰으로만 의존해 DB 없이 jest.fn()으로 테스트가 끝나므로 90% 커버리지가 현실적이 됐다. 얻은 것은 12개 모듈이 같은 규약을 따라 이관 절차가 5단계 체크리스트로 고정됐다는 점이다.

**Q. anti-corruption layer를 왜 class-transformer로 했나요?**

트래커마다 같은 값을 다른 파라미터명·시간 포맷으로 보내고 배열로 오기도 한다. 이 차이가 use-case에 새면 트래커가 늘 때마다 비즈니스 로직에 분기가 생긴다. 트래커별 폴더에 tracking·install·event mapper 3개를 두고 `@Expose({ name })`과 `@Transform`으로 표준 필드로, 시간은 dayjs로 KST ISO로 정규화한다. 바깥에는 `TRACKERS[name].install(query)` 순수 함수로만 노출하고 모듈 계층에서 mapper 직접 사용을 규칙으로 막았다. 새 트래커는 폴더 하나와 레지스트리 한 줄이면 `@IsIn(TRACKER_NAMES)` 검증과 라우팅이 자동으로 붙는다.

"핫패스에서 느리지 않나요?"에는 포스트백은 클릭보다 두 자릿수 적고, 병목은 항상 DB 왕복이었다고 답한다.

**Q. 인증·인가 설계는요?**

전역 APP_GUARD 두 개이고 RolesGuard는 strict라 `@Roles`도 `@Public`도 없으면 403이다. 새 컨트롤러가 조용히 열리는 것보다 조용히 막히는 쪽을 택했다. passport는 헤더 파싱 3줄을 얻으려고 의존성 3개와 전략 클래스를 붙이는 셈이라 @nestjs/jwt만 쓴다. 역할은 USER ⊂ ADMIN ⊂ DEVELOPER이고 별도로 USER는 연결된 광고만 본다. 면제 판정은 한 함수에서만 하고 빈 스코프는 "아무것도 못 봄"이다. 스코프 위반에 403을 쓰지 않는 이유는 프론트가 403을 세션 만료로 보고 로그아웃시키기 때문이라 목록은 빈 배열, 단건은 404다.

근거 `modules/CLAUDE.md` 인증·인가, 광고 스코프

**Q. 커버리지 90% 강제가 의미 없는 테스트를 만들지 않나요?**

백엔드는 modules/ 전체에 걸고 DI 배선뿐인 *.module.ts만 제외했다. 프론트는 범위를 좁혔다. antd·react-table 의존 화면까지 넣으면 불가능해서 대상을 순수 로직 파일(셀 계산·합계·인증 헬퍼·엑셀 워크북·API 응답 매퍼)로 한정했다. 숫자보다 무엇을 테스트하기로 정했는지가 핵심이다. 의미 없는 테스트를 줄인 예로, `_sum.x ?? 0` 매핑 12개가 두 메서드에 중복돼 branch가 46%까지 떨어졌는데 함수 하나로 추출하니 케이스 두 개로 100%가 되고 코드도 짧아졌다.

근거 `apps/frontend/CLAUDE.md` 커버리지 기준, `docs/migration/context-notes.md` 6단계 교훈

**Q. Terraform과 GitHub Actions 구성은요?**

network·backend·database·cache·ecr·frontend·acm·bastion 모듈을 envs/prod에서 조립하고 state 버킷은 bootstrap으로 한 번만 만든다. 시크릿은 Terraform이 생성해 SSM에만 둔다. SES는 레거시 도메인 identity를 그대로 쓰려고 일부러 Terraform 밖에 뒀다. Actions는 main push 시 backend는 arm64 이미지 빌드 후 ECS 배포, frontend는 S3 sync 후 CloudFront 무효화이고 둘 다 OIDC라 정적 키가 없다.

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

맡긴 것은 규약이 명확한 반복 작업이다. 도메인 이관 5단계 반복, 커버리지용 엣지 케이스 spec, DDL 변환 스크립트, 문서 갱신이다. 직접 한 것은 결정과 진단이다. 비용 구조 분석과 단일 AZ, NLB 전환, 컨슈머 사이클 원인 추적, 데드락 해법, MAXLEN 재산정, 캐시 신선도 분리다. 이관 속도 차이가 컸다. 2026-07-10 하루에 인증·advertiser·media·tracker·campaign·advertising 여섯 단계를 각각 4지표 100%로 끝냈다. 에이전트의 결정은 맥락 메모에 남겨 다음 세션이 추론을 반복하지 않게 했다.

근거 `docs/migration/context-notes.md` 단계별 완료 기록

---

## 3. 먼저 꺼낼 약점

면접관이 찾기 전에 말하면 "알고 감수했다"가 되고, 찾힌 뒤면 "몰랐다"가 된다.

- **at-least-once와 누산 집계의 중복 창.** 밀리초 창, 유실보다 중복이 낫다는 판단, 메시지 ID 기록으로 멱등화하는 다음 단계까지.
- **단일 AZ와 Spot 동시 사용.** RDS가 원래 Single-AZ였고 base 온디맨드 1대로 방어했다. 남은 위험은 그 AZ의 Spot 고갈이다.
- **트래킹에 어뷰징 방어가 없음.** NLB라 WAF도 못 붙인다. Valkey 기반 공유 rate limit이 다음 과제다.
- **"48%" 표현과 절감률이 추정치라는 점.** 1절 정정 참고.
- **프론트 커버리지 범위를 순수 로직으로 한정한 것.** 90%를 말할 때 범위를 함께 말한다.

