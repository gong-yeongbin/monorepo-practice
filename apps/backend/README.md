# Backend

광고 관리 플랫폼(광고주/캠페인/매체/트래커)과 Redis Stream 기반 트래킹·포스트백 처리를 담당하는 API 서버입니다. 기본 포트는 3001입니다.

## 기술 스택

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL 17 — Prisma 7 (`@prisma/adapter-pg` driver adapter)
- **Messaging**: Redis Stream (ioredis) — 트래킹·포스트백 비동기 처리
- **Cache**: Redis (ioredis) — 가입 대기 정보·refresh token 저장
- **Mail**: AWS SES — 회원가입 인증 코드 발송
- **Auth**: JWT (`@nestjs/jwt`) — access/refresh 토큰
- **Language**: TypeScript (strict)

## 프로젝트 구조

```
src/
├── main.ts                    # 진입점 (전역 ValidationPipe, PORT 바인딩)
├── main.consumer.ts           # 컨슈머 전용 진입점 (APP_ROLE=consumer 강제)
├── app.module.ts              # 루트 모듈
├── app.controller.ts          # GET /health
├── common/                    # 상태 없는 순수 유틸
├── infra/                     # 공유 인프라 (포트 + 어댑터)
│   ├── prisma/                # PrismaService — PostgreSQL 연결 수명주기
│   ├── cache/                 # CachePort + Redis 어댑터 (TTL은 밀리초)
│   ├── stream/                # Redis Stream 프로듀서·컨슈머
│   ├── mail/                  # MailPort + AWS SES 어댑터
│   ├── http/                  # HttpPort + 외부 HTTP 어댑터 (매체 포스트백 전송)
│   └── storage/               # StoragePort + AWS S3 어댑터 (이미지 업로드)
├── interceptors/              # 응답을 { statusCode, data, _meta }로 감싸는 인터셉터
├── modules/                   # 기능 모듈 — 클린 아키텍처 4계층
│   │                          #   (domain / application / infrastructure / presentation)
│   ├── auth/                  # 회원가입(이메일 인증)·로그인·토큰 재발급
│   ├── user/                  # 사용자 조회·수정·삭제
│   ├── advertiser/            # 광고주 CRUD
│   ├── advertising/           # 광고 CRUD
│   ├── media/                 # 매체 CRUD
│   ├── tracker/               # 트래커 CRUD
│   ├── campaign/              # 캠페인 CRUD
│   ├── config/                # 캠페인별 설정 조회·수정
│   ├── dashboard/             # 대시보드·일별 리포트 조회
│   ├── reservation/           # 트래커 URL 예약 변경 (스케줄러)
│   ├── tracking/              # 트래킹 클릭 수신·리다이렉트
│   └── postback/              # 트래커 포스트백 수신
└── trackers/                  # 트래커 벤더별 파라미터 정의 레지스트리
                               #   (appsflyer / adjust / airbridge / adbrix-remaster)
```

## 실행

로컬 인프라(PostgreSQL + Redis)는 모노레포 루트의 docker compose로 띄웁니다.

```bash
# 루트에서
pnpm install
pnpm docker:up          # postgres:17 (DB: mecross) + redis:alpine

# apps/backend에서 — Prisma 마이그레이션 적용·클라이언트 생성
pnpm deploy
pnpm generate

# 개발 모드 (watch)
pnpm dev                # 루트에서는 pnpm dev --filter=backend

# 빌드 / 프로덕션
pnpm build
pnpm start:prod
```

## 환경 변수

`apps/backend/.env` 파일에 다음 변수를 설정합니다.

```env
# 데이터베이스 (docker-compose 기본값 기준)
DATABASE_URL="postgresql://postgres:1234@localhost:5432/mecross"

# Redis 접속 URL (캐시·스트림 공용, 미설정 시 redis://localhost:6379)
VALKEY="redis://localhost:6379"

# Redis Stream 컨슈머 (미설정 시 mecross-system / consumer-<호스트명>-<PID>)
REDIS_STREAM_GROUP="mecross-system"
REDIS_STREAM_CONSUMER=""

# 프로세스 역할 — api(HTTP만, 소비 루프·스케줄러 없음) / consumer(소비 전용) / all(단일 프로세스, 기본값)
# 운영에서 API·컨슈머를 분리 기동할 때 API 측에 반드시 api를 지정 (컨슈머는 start:consumer가 consumer로 강제)
APP_ROLE="all"

# Redis Stream 튜닝 — XADD MAXLEN 상한(기본 100000), XAUTOCLAIM 회수 최소 유휴 ms(기본 60000)
REDIS_STREAM_MAXLEN=100000
STREAM_CLAIM_MIN_IDLE_MS=60000

# DB 커넥션 풀 크기 (미설정 시 pg Pool 기본 10, 권장: API 30 / 컨슈머 10, 합계 < PostgreSQL max_connections)
DB_CONNECTION_LIMIT=10

# 공개 엔드포인트 rate limit — 60초 창, IP 기준 (기본 tracking 300 / postback 600)
# in-memory 저장소라 API 단일 프로세스 전제. 수평 확장 시 Redis storage 도입 필요.
THROTTLE_TRACKING_LIMIT=300
THROTTLE_POSTBACK_LIMIT=600

# 프록시(LB) 뒤 배포 시 1로 설정 — X-Forwarded-For 기반 클라이언트 IP 식별(rate limit 전제)
# TRUST_PROXY=1

# AWS SES — 회원가입 인증 코드 메일 발송
# 자격 증명은 AWS SDK 기본 체인(AWS_ACCESS_KEY_ID·AWS_SECRET_ACCESS_KEY 등)을 사용
AWS_REGION="ap-northeast-2"
SES_FROM_EMAIL="no-reply@example.com"

# AWS S3 — advertising 이미지 업로드 저장소
# 버킷은 업로드 객체(advertising/*)의 public read(s3:GetObject)를 허용해야 함 — URL이 DB에 영구 저장됨
S3_BUCKET="my-bucket"

# JWT — signin·refresh 토큰 서명 키 (없으면 로그인 시점에 에러)
JWT_ACCESS_SECRET="change-me-access"
JWT_REFRESH_SECRET="change-me-refresh"

# 서버
PORT=3001

# 어드민 API의 CORS 허용 origin (미설정 시 http://localhost:3000)
# 어드민 포트에만 적용된다 — 트래킹 포트는 응답 바이트 절감을 위해 CORS 헤더를 붙이지 않는다.
CORS_ORIGIN="http://localhost:3000"
```

## API 엔드포인트

### 인증·인가

전역 `JwtAuthGuard` + `RolesGuard`가 모든 라우트에 적용됩니다. 어드민 API는 `Authorization: Bearer <access_token>` 헤더를 요구하며(없거나 무효면 401), 역할이 맞지 않으면 403입니다. 아래 표의 **접근** 열이 허용 역할입니다.

| 역할 | 접근 범위 |
|---|---|
| `USER` | 대시보드 조회(`/dashboard/*`)와 그 상세 화면이 쓰는 `GET /advertising/:id`·`GET /postbacks/*`. 신규 가입자의 기본 역할. **단 허용 목록(`user_advertising`)에 있는 광고의 데이터만 보입니다** |
| `ADMIN` | 광고 운영 API 전반 (광고주·광고·캠페인·매체·트래커·설정·예약·포스트백 로그·대시보드) |
| `DEVELOPER` | 전부 + 사용자 관리(`/users`) — 가입 승인·역할 변경·허용 광고 지정·삭제 |

가입은 `POST /auth/signup/verify`로 `role=USER`, `approved=false` 상태의 user를 만듭니다. 승인 전에는 로그인이 403이며, `DEVELOPER`가 `GET /users?approved=false`로 대기 목록을 확인하고 `PATCH /users/:id`에 `{"approved": true, "advertising_ids": [...]}`를 보내 **승인과 동시에 볼 수 있는 광고를 지정**합니다.

#### 광고 스코프 (USER 전용)

`USER`는 `user_advertising`에 연결된 광고의 데이터만 조회됩니다. `DEVELOPER`·`ADMIN`은 면제입니다.

- 허용 목록은 로그인·재발급 시 access token payload의 `advertising_ids`에 실립니다. 따라서 관리자가 목록을 바꿔도 **기존 access token이 만료(15분)되거나 `/auth/refresh`로 재발급될 때 반영**됩니다.
- **허용 목록이 비어 있으면 아무 광고도 보이지 않습니다**(전체 허용이 아닙니다). `advertising_ids: []`는 이 상태를 만드는 유효한 값입니다.
- 스코프 밖 요청은 403이 아니라 **빈 결과(목록) 또는 404(`GET /advertising/:id`)** 로 응답합니다. 프론트가 403을 세션 만료로 보고 로그아웃시키기 때문입니다.
- `GET /dashboard/daily`는 `token`을 생략하면 전체 합산인데, 이 합산도 허용 목록 안으로 제한됩니다.

### 인증 (`/auth`) — 공개

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/auth/email-availability` | 가입 전 이메일 사용 가능 여부 조회 |
| POST | `/auth/signup` | 가입 신청 — 이메일로 6자리 인증 코드 발송 (user 미생성, 200) |
| POST | `/auth/signup/verify` | 코드 검증 통과 시 가입 확정 (201, `role=USER`·`approved=false`) |
| POST | `/auth/signin` | 로그인 — access(15분)·refresh(7일) 토큰 발급 (미승인 user는 403) |
| POST | `/auth/refresh` | refresh token으로 access token 재발급 |

### 트래킹·포스트백 — 공개 (인증 대신 IP 기준 rate limit)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/tracking` | 트래킹 클릭 수신 — 트래커 랜딩 URL로 리다이렉트, Redis Stream으로 비동기 저장 |
| GET | `/:name/install` | 트래커별 install 포스트백 수신 (`name`: appsflyer 등) |
| GET | `/:name/event` | 트래커별 event 포스트백 수신 |

### 어드민 리소스

| 리소스 | 접근 | 라우트 |
|---|---|---|
| user | DEVELOPER | GET `/users`(`?approved=false`로 승인 대기 목록), GET `/users/:id`, PATCH `/users/:id`(role·approved·advertising_ids 수정 = 가입 승인 + 허용 광고 지정), DELETE `/users/:id` |
| advertiser | ADMIN 이상 | GET, POST `/advertisers`, GET, PATCH, DELETE `/advertisers/:id` |
| advertising | ADMIN 이상<br>(`GET /advertising/:id`만 USER 이상) | GET, POST `/advertising`, GET, PUT, DELETE `/advertising/:id`, POST `/advertising/:id/image`. 단건 조회는 대시보드 상세 화면의 InfoCard가 쓰므로 USER에게도 열려 있다 |
| media | ADMIN 이상 | GET, POST `/media`, GET, PATCH, DELETE `/media/:id` |
| tracker | ADMIN 이상 | GET, POST `/trackers`, GET, PATCH, DELETE `/trackers/:id` |
| campaign | ADMIN 이상 | GET, POST `/campaigns`, GET, PATCH, DELETE `/campaigns/:id` |
| config | ADMIN 이상 | GET, PATCH `/config/:campaignId` |
| reservation | ADMIN 이상 | GET, POST `/reservations`(advertisingId 필터·campaign별 예약 행 생성), DELETE `/reservations/:id`. 스케줄러가 매시 정각·부트 시 시각 지난 예약을 campaign(name·tracker_tracking_url)에 적용 |
| dashboard | USER 이상 | GET `/dashboard`, `/dashboard/daily`(token 생략 시 전체 합산), `/dashboard/dailydetail`(token 기준 view_code·pub_id·sub_id 단위), `/dashboard/detail/:id` |
| postback(로그) | USER 이상 | GET `/postbacks/install`, `/postbacks/event`, `/postbacks/unregistered` (대시보드 상세·일별 화면의 로그 팝업용 조회) |

### 기타

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/health` | 헬스체크 (공개) |

## 메시지 흐름

1. 트래킹·포스트백 HTTP 요청을 수신하면 검증 후 Redis Stream에 메시지를 발행하고 즉시 응답합니다.
2. Stream 컨슈머(`XREADGROUP`)가 배치로 메시지를 수신해 DB 저장과 일별 리포트 집계를 수행합니다.
3. 캐시 연결과 스트림 연결은 별도 ioredis 클라이언트로 분리되어 있습니다(`BLOCK` 점유 방지).

## Prisma

`apps/backend`에서 실행합니다.

```bash
pnpm migrate     # 마이그레이션 생성 (--create-only)
pnpm deploy      # 마이그레이션 적용
pnpm generate    # 클라이언트 생성
pnpm reset       # DB 초기화 (초기화 후 seed 자동 실행)
pnpm seed        # 로컬 테스트 데이터 생성 (prisma/seed.ts, 재실행해도 안전)
```

스키마는 `prisma/schema.prisma`에 있고, datasource URL은 `prisma.config.ts`가 `DATABASE_URL`에서 주입합니다.

seed는 역할별 유저 4개와 광고주→트래커→매체→광고(2개)→캠페인(4개)→캠페인 config 그래프, 캠페인당 최근 7일치 daily_report 통계, postback 로그, reservation 2건을 생성합니다. SES 이메일 인증 없이 바로 로그인해 어드민 화면과 대시보드를 확인할 수 있습니다.

| 계정 | 역할 | 승인 | 용도 |
|---|---|---|---|
| `admin@test.com` | DEVELOPER | ✅ | 전체 기능 + 사용자 관리 |
| `ops@test.com` | ADMIN | ✅ | 광고 운영 (사용자 관리 불가) |
| `viewer@test.com` | USER | ✅ | 대시보드 조회만. 허용 광고는 **카페 러시(AOS) 하나** — 펫 월드가 안 보이는 것으로 광고 스코프를 확인 |
| `pending@test.com` | USER | ❌ | 승인 대기 — 로그인 시 403, 승인 API 검증용. 허용 광고 없음(승인 시 지정) |

비밀번호는 모두 `test1234!`입니다.

## 테스트

```bash
pnpm test                    # 단위 테스트
pnpm test -- -t "테스트명"    # 단일 테스트
pnpm test:cov                # 커버리지 — modules/ 는 4지표 90% 이상 유지
pnpm test:e2e                # E2E (./test/jest-e2e.json)
pnpm test:watch              # watch 모드
```

## 코드 포맷팅 및 린트

```bash
pnpm format
pnpm lint
```

## 라이선스

UNLICENSED
