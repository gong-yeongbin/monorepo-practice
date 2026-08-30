# AWS 배포 인프라 (Terraform)

광고 트래킹 플랫폼의 AWS 배포 인프라. **일 1억 클릭(평균 ~1,160 RPS) 실트래픽** 전제로 설계됨. (2026-08-26 확정)

## 아키텍처

> 구성도(요청 경로·정적 자산·단일 AZ 전후 비교): [architecture.html](./architecture.html) — 브라우저로 열면 된다.

```
매체 클릭 / 트래커 포스트백
  │
  └─ api.<도메인>        → NLB (평문 80)      ┐
                                              │
관리자 브라우저                                ├→ ECS Fargate (backend, ARM64)
  │                                           │    태스크 하나가 3001·3002를 모두 listen
  ├─ admin.<도메인>     → CloudFront → S3 (frontend, private + OAC)
  ├─ asset.<도메인>     → CloudFront → S3 (광고 소재, private + OAC)
  └─ admin-api.<도메인> → ALB (HTTPS, ECDSA) ┘    ├─ RDS PostgreSQL (private subnet)
                                                   ├─ ElastiCache Valkey (private subnet, primary + replica 같은 AZ)
                                                   ├─ S3 (앱 스토리지 — 광고 소재 업로드) / SES (task role 권한)
                                                   └─ CloudWatch Logs
```

진입점이 둘이다. 트래킹은 NLB의 평문 80(→ 태스크 3002), 어드민 API는 ALB의 HTTPS(→ 태스크 3001)로 받는다. NLB는 L4라 경로를 못 거르므로 **앱이 진입 포트를 보고 3002에서는 공개 경로(`/tracking`, `/*/install`, `/*/event`, `/health`)만 통과시킨다** — `apps/backend/src/main.ts`.

- VPC `10.0.0.0/16`, 서브넷은 2AZ에 만들되 **실제 리소스는 단일 AZ**(`primary_az_index`, 기본 0)에 몰아넣는다. public 서브넷(ALB/NLB + Fargate), private 서브넷(RDS/Valkey — 인터넷 경로 없음). 두 번째 AZ에는 ALB 노드만 있고 private 서브넷은 subnet group 요구사항 충족용으로 비어 있다
- **NAT Gateway 없음**: Fargate를 public subnet + public IP로 두고 보안그룹으로 차단. 월 ~$37 절감
- 보안그룹 체인: `alb(80,443) → app(3001)` / `nlb(80) → app(3002)` → `rds(5432)/redis(6379)`, 전부 network 모듈에서 생성. **NLB의 SG는 생성 시점에만 지정할 수 있다**
- 시크릿(DB 비밀번호, JWT)은 Terraform이 생성해 SSM Parameter Store(SecureString, 무료)에만 저장 → task definition `secrets`로 주입. tfvars에 비밀 없음
- IAM은 execution role(이미지 pull·로그·시크릿)과 task role(앱 버킷 S3 + SES) 분리 → **정적 AWS 키 불필요**
- **SES는 Terraform이 관리하지 않는다.** 도메인 identity와 DKIM은 레거시가 같은 계정·리전에 이미 만들어 둔 것을 그대로 쓴다. Terraform이 소유하면 destroy 한 번에 레거시 메일 발송까지 끊기고, 존에 이미 있는 DKIM CNAME과 이름이 겹쳐 apply도 실패한다. 앱은 task role의 ses:SendEmail 권한과 ses_from_email 변수만으로 발송한다

## 확정된 설계 결정과 근거

| 결정 | 근거 |
|---|---|
| ECS Fargate ARM64 (Graviton) | x86 대비 컴퓨팅 단가 ~20% 절감. **이미지는 arm64로 빌드 필수** |
| 온디맨드 base 1 + 증설분 Spot | Spot 최대 70% 절감. base 1대는 절대 회수 안 되므로 어드민 API 안전. Spot 회수 시 2분 예고 + LB draining으로 신규 요청은 온디맨드로 라우팅 |
| 오토스케일링 CPU 60%, 2~10대 | 기존 EC2 5대(12 vCPU 버스트, 항상 가동)와 달리 평시 2 vCPU 전용 + 피크에만 증설. Node는 싱글 스레드라 1vCPU/태스크가 적정 단위 |
| RDS `db.t4g.medium` Single-AZ | 기존 xlarge급($373/월)이 오버스펙. 운영 인스턴스 실측 CPU 3.3%(실효 0.13 vCPU)·ReadIOPS 50~90·커넥션 60으로, medium의 베이스라인 0.4 vCPU / gp3 3,000 IOPS / `max_connections` ~450에 모두 크게 못 미친다. 스토리지 20→100GB 자동확장. 미검증 축은 메모리뿐 — 워킹셋이 3GB를 넘으면 tfvars에서 t4g.large, 버스트 자체가 부담되면 m6g.large로 |
| ElastiCache **Valkey** `cache.t4g.medium` | 환경변수도 `VALKEY`, ioredis 호환(Stream 포함), Redis OSS 대비 ~20% 저렴 |
| Valkey primary + replica, **같은 AZ** | 단일 노드면 장애 시 스트림 미처리분과 캠페인 캐시가 통째로 사라지고 `XADD` 실패로 클릭이 큐잉조차 안 된다(캐시 미스가 RDS로 몰리는 연쇄까지). 레플리카로 승격받되 **primary와 같은 AZ에 둔다**(아래 단일 AZ 항목). 노드 장애 페일오버는 유지되고 AZ 장애 대비만 포기한다. 단 복제가 비동기라 전환 직전 수 초는 유실 가능하고 전환에 1~2분 — 유실 0이 아니라 분 단위를 초 단위로 줄이는 장치. 스냅샷 3일 보관 별도(레플리카는 실수 삭제를 못 살림) |
| `REDIS_STREAM_MAXLEN` 200만 | `XADD MAXLEN ~`는 소비 여부와 무관하게 트림하므로 스트림 길이가 곧 컨슈머 지연 허용치. 앱 기본값 10만은 ~86초치라 배포·RDS 장애만으로도 미소비 클릭이 조용히 유실된다. 200만이면 ~29분치(피크 3배에도 ~10분)이고 tracking 엔트리 기준 ~300MB로 3.1GB에 여유 |
| Global Accelerator 제거 | 고정 IP 불필요 확인 — Route53 alias(도메인→LB)로 충분. GA 고정비 + DT 프리미엄 제거 |
| frontend는 CloudFront 필수 | S3 정적 웹 호스팅 단독은 HTTPS 불가. 403/404→index.html로 SPA 라우팅, PriceClass_200(한국 엣지 포함) |
| **광고 소재도 CloudFront + OAC** | 업로드된 이미지를 어드민이 `<img src>`로 익명 GET하는데 앱 버킷은 퍼블릭 액세스가 전면 차단이라 S3 정적 URL이 403이다. 버킷을 여는 대신 frontend와 같은 OAC 패턴을 쓴다 — 버킷은 계속 비공개이고 버킷 정책은 `advertising/*` prefix만 CloudFront에 연다. 앱은 `ASSET_BASE_URL` 접두사만 붙이면 된다 |
| 광고 소재는 별도 서브도메인 `asset.<domain>` | 업로드 시점의 **절대 URL이 `advertising.image` 컬럼에 영구 저장**된다. `*.cloudfront.net`을 쓰면 배포를 다시 만드는 순간 저장된 URL이 전부 깨진다. 같은 이유로 `asset_subdomain`은 배포 후 사실상 변경 불가 |
| 광고 소재 캐시 키에 쿼리스트링 포함 | 관리형 CachingOptimized는 쿼리스트링을 캐시 키에서 뺀다. 키가 `advertising/{id}` 고정(덮어쓰기)이라 프론트의 `?{uuid}` 캐시버스터가 무시되면 이미지를 새로 올려도 옛 것이 계속 나온다. 대가는 uuid가 매번 달라 캐시 히트가 사실상 0이라는 것 — 어드민만 보는 저트래픽이라 감수한다 |
| ACM 인증서 **ECDSA(P-256)** | 핸드셰이크 바이트 절감. 단, 트래킹이 HTTP로 확인되어(아래) 효과는 HTTPS를 쓰는 어드민 트래픽에 한정 |
| **트래킹은 ALB가 아니라 NLB** | LCU는 4개 차원 중 최댓값 하나로만 과금되는데, 클릭은 재사용 없는 일회성 연결이라 신규 연결 차원이 홀로 지배한다. ALB는 LCU당 25/s라 1,157/s면 **46 LCU(월 ~$270)**, NLB는 NLCU당 800/s라 1.4 NLCU에 그쳐 처리 바이트 4.2가 최댓값이 된다(**월 ~$35**). 대가는 L4라 경로를 못 본다는 것 |
| **80 포트: 트래킹·포스트백만 직접 포워드** | 매체에 배포된 링크가 `http://api.mecrosspro.com/tracking?...` — HTTPS 강제 리다이렉트를 끼우면 클릭당 왕복 2배. NLB는 경로 분기를 못 하므로 **앱이 진입 포트로 가른다**: 3002(NLB)에서는 `/tracking`, `/*/install`, `/*/event`, `/health`만 통과시키고 나머지는 404. 이게 없으면 어드민 API가 평문 80에 그대로 열린다 |
| 어드민만 새 서브도메인 | `api.<domain>`은 매체·트래커에 배포돼 있어 바꿀 수 없고, 한 호스트명의 A 레코드는 LB 하나만 가리킨다("80은 NLB, 443은 ALB"가 불가능). 그래서 프론트만 쓰는 어드민 쪽을 `admin-api.<domain>`으로 옮겼다 — 변경 비용은 `VITE_API_URL` 한 줄 |
| **컴퓨팅·데이터 스토어 전부 단일 AZ** | 2026-08-30 Cost Explorer 실측에서 레거시가 AZ 간 전송에만 월 $215~270을 쓰고 있었다 — 앱(2a)과 ElastiCache(2b/2c)가 갈려 클릭마다의 `XADD`·캐시 조회가 전부 AZ를 넘었다(양방향 과금). Fargate·NLB·RDS·Valkey를 한 AZ에 몰아 이 항목을 $0으로 만든다. AZ 장애 시 전체 중단이지만 **RDS가 Single-AZ라 원래도 AZ 장애를 못 견딘다** — 살아남지 못할 시나리오에 전송료를 내지 않는다. 대가: 해당 AZ의 Fargate Spot 용량이 마르면 증설이 온디맨드에 의존 |
| ALB만 2AZ 유지 | ALB는 AWS 요구사항상 서브넷이 2개 AZ에 걸쳐야 한다. 다만 **ALB는 cross-zone 전송이 무료**라(NLB·CLB와 다르다) 비용 영향이 없다. NLB는 유료라 단일 AZ로 두고 cross-zone을 끈다 |
| NLB에 보안그룹 부착 | `preserve_client_ip`를 켜면 태스크가 보는 출발지가 실제 클라이언트라, SG가 없으면 app SG의 3002를 `0.0.0.0/0`으로 열어야 해 SG 체인에 구멍이 난다. **NLB의 SG는 생성 시점에만 지정 가능** |
| `TRUST_PROXY` 주입 안 함 | NLB는 L4라 `X-Forwarded-For`를 붙이지도 지우지도 않는다 — 켜면 클라이언트가 헤더를 위조해 IP 기준 rate limit을 통째로 우회한다. `preserve_client_ip`가 소켓 주소를 실제 IP로 보존하므로 헤더 자체가 불필요 |
| 도메인은 기존 것 사용 | 같은 계정 Route53 zone을 data source로 조회, `api.`(NLB)/`admin-api.`(ALB)/`admin.`(CloudFront) 레코드만 추가. 기존 레코드 무영향 |
| DB/Redis 새로 생성 | 기존 RDS/ElastiCache는 데이터 이전 후 삭제 예정. 새 DB는 PostgreSQL이라 mysqldump 불가 — pgloader 또는 AWS DMS 등 이기종 이전 도구 필요 |

## 비용

**기존 (2026-07 청구서, Onetwoad 계정): 월 $1,792** — Data Transfer $865(48%), RDS $373, EC2 $348, ElastiCache $147, VPC $37, GA $19

**새 설계 예상: 월 $810~1,040 (기본 40~55% 절감, 전송량 최적화 성공 시 60% 이상)**

| 항목 | 예상/월 |
|---|---|
| Fargate (온디맨드 1 + Spot 평균 2~3) | $50~80 |
| NLB 트래킹 (처리 바이트 ~4.2 NLCU가 최댓값) | ~$35 |
| ALB 어드민 (LCU 거의 발생 안 함) | ~$17 |
| AZ 간 전송 (단일 AZ 배치로 제거) | **$0** |
| RDS db.t4g.medium | ~$55 |
| ElastiCache cache.t4g.medium × 2 (primary + replica) | ~$96 |
| **Data Transfer** (GA 제거 + ECDSA 반영) | **$500~700** |
| Route53/S3/ECR/IPv4/로그 등 | ~$40 |

트래킹을 ALB로 받았다면 이 표의 LB 항목이 $200~300이 된다. NLB 전환으로 **월 ~$220**을 덜어냈고, 남은 최대 변수는 여전히 Data Transfer다.

### 전송량 절감 계획 (최대 변수 — apply 후 Cost Explorer로 실측 필요)

**2026-08-26 실측**: `api.mecrosspro.com`은 EC2 1대(3.34.25.161)에 A 레코드 직결(nginx→Express), ALB/GA 미경유, **HTTP 전용(TLS 없음)**.

**2026-08-30 Cost Explorer 실측 — DT $865의 구성이 규명됐다.**

| USAGE_TYPE | 2026-07 용량 | 비용 |
|---|---|---|
| `APN2-DataTransfer-Out-Bytes` (인터넷 egress) | 5,118 GB | $632 |
| `APN2-DataTransfer-Regional-Bytes` (AZ 간) | 23,283 GB | $233 |

- 이전에 적어 둔 "청구 7.6TB"는 **무료인 inbound 2,493GB를 합산한 값**이었다. 실제 과금 egress는 5.1TB이고, 리다이렉트 추산(2~3TB)과의 격차는 4~5TB가 아니라 **2~3TB**로 줄었다.
- 진짜 놓치고 있던 건 별도 라인인 **AZ 간 전송 $233**이고, 원인은 배치 실수다: WAS 4대와 RDS는 `2a`인데 ElastiCache 두 노드가 `2b`·`2c`에 있어 캐시 트래픽 전량이 AZ를 넘는다. CloudWatch 실측 캐시 트래픽 월 ~10.2TB × 양방향 = 청구 ~20.5TB로 8월 청구 21,550GB와 일치한다.
- 4개월 내내 일관적이다: 5월 $271 → 6월 $269 → 7월 $233 → 8월 $216.
- → **신규 스택은 단일 AZ 배치로 이 항목을 $0으로 만든다.**

1. ✅ 80 포트 트래킹 직접 포워드 (리다이렉트 왕복 제거, Terraform 반영됨)
2. ✅ GA 제거 (현재도 트래킹 경로엔 미사용으로 확인 — 월 $19 정리 대상)
3. ⬜ 앱 레벨: `res.redirect()` 기본 HTML 바디 제거, `X-Powered-By`·ETag 헤더 제거 (현 서버 기준 월 $50~100 수준)
4. ✅ **Cost Explorer로 DT 구성 규명 완료** (2026-08-30) — AZ 간 전송 $233은 단일 AZ 배치로 제거, egress 5.1TB 중 2~3TB는 여전히 미규명
5. ⬜ 남은 egress 2~3TB 출처 규명 (포스트백 발신 재시도가 유력) — 인터넷 egress라 단일 AZ로는 안 줄어든다

### ⚠️ 비용 함정

- **트래킹 경로에서 클릭당 CloudWatch 로그 1줄 = 월 $400+** (하루 20GB 유입). 앱에서 반드시 억제할 것
- RDS t4g는 unlimited 모드라 크레딧 소진 시 스로틀 대신 추가 과금 — CPU 크레딧 잔량 모니터링
- Redis 메모리 사용률 모니터링 (스트림 소비 지연 시 3GB가 한계선)

## 디렉토리 구조

```
infra/terraform/
├── bootstrap/        # state 버킷 생성 (로컬 state, 1회 apply)
├── modules/
│   ├── network/      # VPC, 서브넷, 보안그룹 4종
│   ├── database/     # RDS + DATABASE_URL SSM 파라미터
│   ├── cache/        # ElastiCache Valkey
│   ├── ecr/          # backend 이미지 리포지토리
│   ├── acm/          # 인증서 + DNS 검증 (ALB용 서울 / CloudFront용 us-east-1)
│   ├── backend/      # ALB, ECS, IAM, 오토스케일링, JWT SSM
│   ├── frontend/     # S3 + CloudFront OAC
│   └── bastion/      # SSM 점프 호스트 (기본 off — 아래 접속 항목 참고)
└── envs/prod/        # 모듈 배선, Route53, 앱 S3 버킷, 소재 CDN, tfvars
```

## DB·캐시에 사람이 접속하는 법

RDS와 Valkey는 private subnet에 있고 보안그룹이 app 태스크에서만 열려 있다. `publicly_accessible = false`이고 인터넷 경로 자체가 없으므로 **비밀번호를 알아도 로컬에서 직접 붙을 수 없다.** 접속이 필요하면 `bastion` 모듈을 켠다.

```bash
# 1. 점프 호스트를 켠다 (tfvars 또는 -var)
terraform apply -var bastion_enabled=true

# 2. 출력된 명령을 그대로 실행 — 터미널을 열어둔 채로 유지한다
terraform output -raw bastion_db_port_forward
# → aws ssm start-session --target i-xxxx --document-name AWS-StartPortForwardingSessionToRemoteHost ...

# 3. DataGrip·psql 등에서 localhost:15432 로 접속
#    user는 db_username(기본 app), 비밀번호는 아래에서 꺼낸다
aws ssm get-parameter --name /mecross/prod/DATABASE_URL --with-decryption --query Parameter.Value --output text

# 4. 끝나면 되돌린다 — 인스턴스가 destroy되어 접근 경로와 비용이 함께 사라진다
terraform apply -var bastion_enabled=false
```

Valkey를 보려면 같은 명령에서 host를 캐시 엔드포인트로, port를 6379로 바꾸면 된다.

- **로컬에 `session-manager-plugin`이 따로 필요하다.** AWS CLI 공식 pkg에 포함되지 않는다 — `brew install --cask session-manager-plugin`
- 점프 호스트는 **인바운드 규칙이 하나도 없다.** SSH 키페어도 만들지 않는다. Session Manager가 아웃바운드 443으로만 통신하기 때문이며, 접근 통제는 SG가 아니라 IAM이 한다(세션 기록은 CloudTrail에 남는다).
- `bastion_enabled = true`일 때만 RDS SG에 5432, Valkey SG에 6379가 점프 호스트 대상으로 열린다. false로 되돌리면 규칙까지 같이 사라진다.
- 비용은 월 ~$7(t4g.nano $3.1 + 공인 IPv4 $3.6). 상시 켜둘 리소스가 아니다.
- RDS PostgreSQL 15+ 는 기본 파라미터 그룹이 `rds.force_ssl = 1`이라 평문 연결을 거부한다. 클라이언트 SSL 모드가 `prefer` 이상이어야 한다.

## 배포 절차

```bash
# 0. 사전 준비 (1회)
brew install awscli && aws configure     # 새 IAM 키, region: ap-northeast-2
# ⚠️ apps/backend/.env의 기존 AKIA... 키는 재사용 금지 — 폐기 대상

# 1. state 버킷 bootstrap (1회)
cd infra/terraform/bootstrap
terraform init && terraform apply
# → 출력된 버킷명을 envs/prod/backend.tf 의 bucket 에 기입

# 2. 본 인프라
cd ../envs/prod
cp terraform.tfvars.example terraform.tfvars   # domain_name, ses_from_email 기입
terraform init && terraform plan && terraform apply
# 최초 apply는 backend_desired_count = 0 (ECR에 이미지가 아직 없음)
# cutover_dns_enabled = false 라 api·admin 레코드는 만들지 않는다 (아래 참고)

# 3. 이미지 push 후 (Dockerfile은 후속 단계)
# backend_desired_count = 2, backend_autoscaling_enabled = true 로 재-apply

# 4. 컷오버 시점에만
# cutover_dns_enabled = true 로 재-apply → api·admin 레코드가 신규 스택을 가리킨다
```

### ⚠️ `api.<domain>`·`admin.<domain>`은 레거시가 쓰는 이름이다

두 레코드는 지금 레거시 EC2와 레거시 S3 어드민을 가리키고 있다. **레코드를 만드는 행위 자체가
프로덕션 컷오버**라서 `cutover_dns_enabled`(기본 `false`)로 가둬 뒀다. `false`인 동안은 두 레코드를
아예 만들지 않으므로 레거시가 그대로 트래픽을 받고, 신규 스택은 `nlb_dns_name`·`alb_dns_name`과
CloudFront 도메인으로 직접 검증한다. `admin-api.`·`asset.`은 신규 이름이라 처음부터 만든다.

컷오버 절차 전체는 `~/.claude/plans/stateless-meandering-aho.md` 참고.

검증만 할 때 (자격증명 불필요):

```bash
terraform fmt -check -recursive
cd envs/prod && terraform init -backend=false && terraform validate
```

## 남은 작업 (순서대로)

1. ✅ AWS 자격증명 설정 · **Cost Explorer 실측 완료**(2026-08-30) → ⬜ bootstrap → plan/apply
2. Dockerfile (pnpm workspace + **arm64** + `prisma migrate deploy` 전략) + CI/CD
3. 앱 수정: CORS `localhost:3000` 하드코딩 해제(`apps/backend/src/main.ts`), 302 응답 슬림화, 트래킹 로그 억제
4. frontend 빌드(`VITE_API_URL=https://admin-api.<도메인>` — `admin_api_url` 출력 참조) → S3 sync + CloudFront invalidation
5. 데이터 이전(MySQL → PostgreSQL 이기종: pgloader/AWS DMS) → 기존 EC2/RDS/ElastiCache/GA 정리
6. 노출된 IAM 키 폐기
