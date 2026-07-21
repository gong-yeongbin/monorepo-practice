# Backend

광고 관리 플랫폼(광고주/캠페인/매체/트래커)과 Redis Stream 기반 트래킹·포스트백 처리를 담당하는 API 서버입니다. 기본 포트는 3001입니다.

## 기술 스택

- **Framework**: NestJS 11.x
- **Database**: MySQL 8 — Prisma 7 (`@prisma/adapter-mariadb` driver adapter)
- **Messaging**: Redis Stream (ioredis) — 트래킹·포스트백 비동기 처리
- **Cache**: Redis (ioredis) — 가입 대기 정보·refresh token 저장
- **Mail**: AWS SES — 회원가입 인증 코드 발송
- **Auth**: JWT (`@nestjs/jwt`) — access/refresh 토큰
- **Language**: TypeScript (strict)

## 프로젝트 구조

```
src/
├── main.ts                    # 진입점 (전역 ValidationPipe, PORT 바인딩)
├── app.module.ts              # 루트 모듈
├── app.controller.ts          # GET /health
├── common/                    # 상태 없는 순수 유틸
├── infra/                     # 공유 인프라 (포트 + 어댑터)
│   ├── prisma/                # PrismaService — MySQL 연결 수명주기
│   ├── cache/                 # CachePort + Redis 어댑터 (TTL은 밀리초)
│   ├── stream/                # Redis Stream 프로듀서·컨슈머
│   └── mail/                  # MailPort + AWS SES 어댑터
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
│   ├── partner/               # 파트너 조회
│   ├── dashboard/             # 대시보드·일별 리포트 조회
│   ├── tracking/              # 트래킹 클릭 수신·리다이렉트
│   └── postback/              # 트래커 포스트백 수신
└── trackers/                  # 트래커 벤더별 파라미터 정의 레지스트리
                               #   (appsflyer / adjust / airbridge / adbrix-remaster)
```

## 실행

로컬 인프라(MySQL + Redis)는 모노레포 루트의 docker compose로 띄웁니다.

```bash
# 루트에서
pnpm install
pnpm docker:up          # mysql:8.0 (DB: mecross) + redis:alpine

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
DATABASE_URL="mysql://root:1234@localhost:3306/mecross"

# Redis 접속 URL (캐시·스트림 공용, 미설정 시 redis://localhost:6379)
VALKEY="redis://localhost:6379"

# Redis Stream 컨슈머 (미설정 시 mecross-system / consumer-1)
REDIS_STREAM_GROUP="mecross-system"
REDIS_STREAM_CONSUMER="consumer-1"

# AWS SES — 회원가입 인증 코드 메일 발송
# 자격 증명은 AWS SDK 기본 체인(AWS_ACCESS_KEY_ID·AWS_SECRET_ACCESS_KEY 등)을 사용
AWS_REGION="ap-northeast-2"
SES_FROM_EMAIL="no-reply@example.com"

# JWT — signin·refresh 토큰 서명 키 (없으면 로그인 시점에 에러)
JWT_ACCESS_SECRET="change-me-access"
JWT_REFRESH_SECRET="change-me-refresh"

# 서버
PORT=3001
```

## API 엔드포인트

### 인증 (`/auth`)

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/auth/signup` | 가입 신청 — 이메일로 6자리 인증 코드 발송 (user 미생성, 200) |
| POST | `/auth/signup/verify` | 코드 검증 통과 시 가입 확정 (201) |
| POST | `/auth/signin` | 로그인 — access(15분)·refresh(7일) 토큰 발급 (미승인 user는 403) |
| POST | `/auth/refresh` | refresh token으로 access token 재발급 |

### 트래킹·포스트백

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/tracking` | 트래킹 클릭 수신 — 트래커 랜딩 URL로 리다이렉트, Redis Stream으로 비동기 저장 |
| GET | `/:name/install` | 트래커별 install 포스트백 수신 (`name`: appsflyer 등) |
| GET | `/:name/event` | 트래커별 event 포스트백 수신 |

### 어드민 리소스

| 리소스 | 라우트 |
|---|---|
| user | GET `/user`, GET `/user/:id`, PATCH `/user/:id`, DELETE `/user/:id` |
| advertiser | GET, POST `/advertiser`, GET, PATCH, DELETE `/advertiser/:id` |
| advertising | GET, POST `/advertising`, GET, PUT, DELETE `/advertising/:id` |
| media | GET, POST `/media`, GET, PATCH, DELETE `/media/:id` |
| tracker | GET, POST `/tracker`, GET, PATCH, DELETE `/tracker/:id` |
| campaign | GET, POST `/campaign`, GET, PATCH, DELETE `/campaign/:id` |
| config | GET, PATCH `/config/:campaignId` |
| partner | GET `/partner/:id` |
| dashboard | GET `/dashboard`, `/dashboard/daily`, `/dashboard/dailydetail`, `/dashboard/dailydetail/excel`, `/dashboard/detail/:id` |

### 기타

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/health` | 헬스체크 |

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
pnpm reset       # DB 초기화
```

스키마는 `prisma/schema.prisma`에 있고, datasource URL은 `prisma.config.ts`가 `DATABASE_URL`에서 주입합니다.

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
