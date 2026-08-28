# AWS 배포 인프라 (Terraform)

광고 트래킹 플랫폼의 AWS 배포 인프라. **일 1억 클릭(평균 ~1,160 RPS) 실트래픽** 전제로 설계됨. (2026-08-26 확정)

## 아키텍처

```
매체 클릭 / 트래커 포스트백
  │
  └─ api.<도메인>        → NLB (평문 80)      ┐
                                              │
관리자 브라우저                                ├→ ECS Fargate (backend, ARM64)
  │                                           │    태스크 하나가 3001·3002를 모두 listen
  ├─ admin.<도메인>     → CloudFront → S3 (frontend, private + OAC)
  └─ admin-api.<도메인> → ALB (HTTPS, ECDSA) ┘    ├─ RDS PostgreSQL (private subnet)
                                                   ├─ ElastiCache Valkey (private subnet, primary + replica 2AZ)
                                                   ├─ S3 (앱 스토리지) / SES (task role 권한)
                                                   └─ CloudWatch Logs
```

진입점이 둘이다. 트래킹은 NLB의 평문 80(→ 태스크 3002), 어드민 API는 ALB의 HTTPS(→ 태스크 3001)로 받는다. NLB는 L4라 경로를 못 거르므로 **앱이 진입 포트를 보고 3002에서는 공개 경로(`/tracking`, `/*/install`, `/*/event`, `/health`)만 통과시킨다** — `apps/backend/src/main.ts`.

- VPC `10.0.0.0/16`, 2AZ. public 서브넷(ALB/NLB + Fargate), private 서브넷(RDS/Valkey — 인터넷 경로 없음)
- **NAT Gateway 없음**: Fargate를 public subnet + public IP로 두고 보안그룹으로 차단. 월 ~$37 절감
- 보안그룹 체인: `alb(80,443) → app(3001)` / `nlb(80) → app(3002)` → `rds(5432)/redis(6379)`, 전부 network 모듈에서 생성. **NLB의 SG는 생성 시점에만 지정할 수 있다**
- 시크릿(DB 비밀번호, JWT)은 Terraform이 생성해 SSM Parameter Store(SecureString, 무료)에만 저장 → task definition `secrets`로 주입. tfvars에 비밀 없음
- IAM은 execution role(이미지 pull·로그·시크릿)과 task role(앱 버킷 S3 + SES) 분리 → **정적 AWS 키 불필요**

## 확정된 설계 결정과 근거

| 결정 | 근거 |
|---|---|
| ECS Fargate ARM64 (Graviton) | x86 대비 컴퓨팅 단가 ~20% 절감. **이미지는 arm64로 빌드 필수** |
| 온디맨드 base 1 + 증설분 Spot | Spot 최대 70% 절감. base 1대는 절대 회수 안 되므로 어드민 API 안전. Spot 회수 시 2분 예고 + LB draining으로 신규 요청은 온디맨드로 라우팅 |
| 오토스케일링 CPU 60%, 2~10대 | 기존 EC2 5대(12 vCPU 버스트, 항상 가동)와 달리 평시 2 vCPU 전용 + 피크에만 증설. Node는 싱글 스레드라 1vCPU/태스크가 적정 단위 |
| RDS `db.t4g.medium` Single-AZ | 기존 xlarge급($373/월)이 오버스펙. 운영 인스턴스 실측 CPU 3.3%(실효 0.13 vCPU)·ReadIOPS 50~90·커넥션 60으로, medium의 베이스라인 0.4 vCPU / gp3 3,000 IOPS / `max_connections` ~450에 모두 크게 못 미친다. 스토리지 20→100GB 자동확장. 미검증 축은 메모리뿐 — 워킹셋이 3GB를 넘으면 tfvars에서 t4g.large, 버스트 자체가 부담되면 m6g.large로 |
| ElastiCache **Valkey** `cache.t4g.medium` | 환경변수도 `VALKEY`, ioredis 호환(Stream 포함), Redis OSS 대비 ~20% 저렴 |
| Valkey primary + replica, 자동 페일오버 | 단일 노드면 장애 시 스트림 미처리분과 캠페인 캐시가 통째로 사라지고 `XADD` 실패로 클릭이 큐잉조차 안 된다(캐시 미스가 RDS로 몰리는 연쇄까지). 다른 AZ 레플리카로 승격. 단 복제가 비동기라 전환 직전 수 초는 유실 가능하고 전환에 1~2분 — 유실 0이 아니라 분 단위를 초 단위로 줄이는 장치. 스냅샷 3일 보관 별도(레플리카는 실수 삭제를 못 살림) |
| `REDIS_STREAM_MAXLEN` 200만 | `XADD MAXLEN ~`는 소비 여부와 무관하게 트림하므로 스트림 길이가 곧 컨슈머 지연 허용치. 앱 기본값 10만은 ~86초치라 배포·RDS 장애만으로도 미소비 클릭이 조용히 유실된다. 200만이면 ~29분치(피크 3배에도 ~10분)이고 tracking 엔트리 기준 ~300MB로 3.1GB에 여유 |
| Global Accelerator 제거 | 고정 IP 불필요 확인 — Route53 alias(도메인→LB)로 충분. GA 고정비 + DT 프리미엄 제거 |
| frontend는 CloudFront 필수 | S3 정적 웹 호스팅 단독은 HTTPS 불가. 403/404→index.html로 SPA 라우팅, PriceClass_200(한국 엣지 포함) |
| ACM 인증서 **ECDSA(P-256)** | 핸드셰이크 바이트 절감. 단, 트래킹이 HTTP로 확인되어(아래) 효과는 HTTPS를 쓰는 어드민 트래픽에 한정 |
| **트래킹은 ALB가 아니라 NLB** | LCU는 4개 차원 중 최댓값 하나로만 과금되는데, 클릭은 재사용 없는 일회성 연결이라 신규 연결 차원이 홀로 지배한다. ALB는 LCU당 25/s라 1,157/s면 **46 LCU(월 ~$270)**, NLB는 NLCU당 800/s라 1.4 NLCU에 그쳐 처리 바이트 4.2가 최댓값이 된다(**월 ~$35**). 대가는 L4라 경로를 못 본다는 것 |
| **80 포트: 트래킹·포스트백만 직접 포워드** | 매체에 배포된 링크가 `http://api.mecrosspro.com/tracking?...` — HTTPS 강제 리다이렉트를 끼우면 클릭당 왕복 2배. NLB는 경로 분기를 못 하므로 **앱이 진입 포트로 가른다**: 3002(NLB)에서는 `/tracking`, `/*/install`, `/*/event`, `/health`만 통과시키고 나머지는 404. 이게 없으면 어드민 API가 평문 80에 그대로 열린다 |
| 어드민만 새 서브도메인 | `api.<domain>`은 매체·트래커에 배포돼 있어 바꿀 수 없고, 한 호스트명의 A 레코드는 LB 하나만 가리킨다("80은 NLB, 443은 ALB"가 불가능). 그래서 프론트만 쓰는 어드민 쪽을 `admin-api.<domain>`으로 옮겼다 — 변경 비용은 `VITE_API_URL` 한 줄 |
| NLB cross-zone 활성화 | NLB는 기본이 off이고 off면 타깃 없는 AZ의 노드로 온 트래픽이 그냥 실패한다(ALB는 기본 on). 트래킹 유실은 곧 매출이라 켠다. 대가는 AZ 간 전송 월 ~$15 |
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
| AZ 간 전송 (NLB cross-zone) | ~$15 |
| RDS db.t4g.medium | ~$55 |
| ElastiCache cache.t4g.medium × 2 (primary + replica) | ~$96 |
| **Data Transfer** (GA 제거 + ECDSA 반영) | **$500~700** |
| Route53/S3/ECR/IPv4/로그 등 | ~$40 |

트래킹을 ALB로 받았다면 이 표의 LB 항목이 $200~300이 된다. NLB 전환으로 **월 ~$220**을 덜어냈고, 남은 최대 변수는 여전히 Data Transfer다.

### 전송량 절감 계획 (최대 변수 — apply 후 Cost Explorer로 실측 필요)

**2026-08-26 실측 발견**: `api.mecrosspro.com`은 EC2 1대(3.34.25.161)에 A 레코드 직결(nginx→Express), ALB/GA 미경유, **HTTP 전용(TLS 없음)**. 302 응답 실측 기준 리다이렉트 트래픽은 월 2~3TB 수준으로 추산되는데 청구는 7.6TB — **4~5TB의 출처 불명 트래픽 존재**. 유력 용의자: 매체 포스트백 발신(재시도 3회 포함), 긴 Location URL, 타 서브도메인. → Cost Explorer 실측이 절감의 열쇠.

1. ✅ 80 포트 트래킹 직접 포워드 (리다이렉트 왕복 제거, Terraform 반영됨)
2. ✅ GA 제거 (현재도 트래킹 경로엔 미사용으로 확인 — 월 $19 정리 대상)
3. ⬜ 앱 레벨: `res.redirect()` 기본 HTML 바디 제거, `X-Powered-By`·ETag 헤더 제거 (현 서버 기준 월 $50~100 수준)
4. ⬜ **Cost Explorer로 미확인 4~5TB 출처 규명** — 가장 큰 잠재 절감

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
│   └── frontend/     # S3 + CloudFront OAC
└── envs/prod/        # 모듈 배선, Route53, SES, 앱 S3 버킷, tfvars
```

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

# 3. 이미지 push 후 (Dockerfile은 후속 단계)
# backend_desired_count = 2, backend_autoscaling_enabled = true 로 재-apply
```

검증만 할 때 (자격증명 불필요):

```bash
terraform fmt -check -recursive
cd envs/prod && terraform init -backend=false && terraform validate
```

## 남은 작업 (순서대로)

1. AWS 자격증명 설정 → **Cost Explorer로 DT $865 구성 실측** → bootstrap → plan/apply
2. Dockerfile (pnpm workspace + **arm64** + `prisma migrate deploy` 전략) + CI/CD
3. 앱 수정: CORS `localhost:3000` 하드코딩 해제(`apps/backend/src/main.ts`), 302 응답 슬림화, 트래킹 로그 억제
4. frontend 빌드(`VITE_API_URL=https://admin-api.<도메인>` — `admin_api_url` 출력 참조) → S3 sync + CloudFront invalidation
5. 데이터 이전(MySQL → PostgreSQL 이기종: pgloader/AWS DMS) → 기존 EC2/RDS/ElastiCache/GA 정리
6. SES 샌드박스 해제(수동), 노출된 IAM 키 폐기
