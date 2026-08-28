# Monorepo Practice

광고 관리 플랫폼(광고주/광고/캠페인/매체/트래커)과 트래킹·포스트백 시스템입니다. pnpm + Turborepo 기반 모노레포이며, 애플리케이션은 `apps/backend`(NestJS API)와 `apps/frontend`(React 어드민) 두 개입니다.

## 📋 프로젝트 개요

광고주, 광고, 캠페인, 매체, 트래커를 관리하는 어드민 API와 화면, 그리고 트래킹 데이터 처리 백엔드로 구성됩니다. 다양한 트래킹 솔루션으로부터 클릭·설치·이벤트 데이터를 수신해 집계하고 매체사로 포스트백을 전송합니다.

### 주요 기능

- **어드민 리소스 관리**: 광고주·광고·캠페인·매체·트래커 CRUD와 대시보드 조회
- **인증·인가**: 이메일 인증 코드 기반 2단계 회원가입 + 관리자 승인 + JWT access/refresh 토큰. 역할(`USER`⊂`ADMIN`⊂`DEVELOPER`) 기반으로 어드민 API 접근을 제한 (`USER`는 대시보드 조회만)
- **트래킹 처리**: 다양한 트래킹 솔루션(AppsFlyer, Adjust, Airbridge, AdbrixRemaster) 지원
- **포스트백 전송**: 매체사로 포스트백 전송 (공개 수신 엔드포인트는 IP 기준 rate limit)
- **일별 집계**: `daily_report`로 클릭/설치/이벤트/매출 등을 KST 기준 일별 집계
- **예약 변경**: 캠페인 상위 트래커 URL을 지정 시각에 일괄 변경 (스케줄러 실행)
- **비동기 메시징**: Redis Stream 기반 consumer group으로 트래킹·포스트백 배치 처리 (API·컨슈머 프로세스 분리 가능)
- **API 문서**: Swagger(OpenAPI) UI 제공 (`/docs`)

## 🏗️ 아키텍처

```
┌───────────────────────────────────────────────────────────────┐
│                    Monorepo (Turborepo)                        │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│   ┌──────────────┐   HTTP(axios)   ┌──────────────┐            │
│   │   frontend   │ ──────────────▶ │   backend    │            │
│   │ (React/Vite) │                 │  (NestJS)    │            │
│   │    :3000     │                 │    :3001     │            │
│   └──────────────┘                 └──────┬───────┘            │
│                                           │                    │
│                        Prisma ────────────┼──── Redis          │
│                                           │  (Stream + Cache)  │
│                                  ┌────────▼────────┐           │
│                                  │ Postgres(Prisma)│           │
│                                  └─────────────────┘           │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ eslint-config│  │ ts-config    │                            │
│  │   (shared)   │  │   (shared)   │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## 🛠️ 기술 스택

### 백엔드 (`apps/backend`)

- **NestJS 11**: Node.js 프레임워크
- **Prisma 7**: ORM 및 데이터베이스 관리 (`@prisma/adapter-pg` driver adapter)
- **ioredis**: Redis Stream(비동기 메시징) + Redis 캐시 클라이언트
- **@nestjs/jwt / bcrypt**: JWT access·refresh 토큰과 비밀번호 해싱
- **@nestjs/throttler**: 공개 엔드포인트(트래킹·포스트백) IP 기준 rate limit
- **@nestjs/schedule**: 트래커 URL 예약 변경 스케줄러
- **@aws-sdk/client-ses / client-s3**: 회원가입 인증 코드 메일 발송, advertising 이미지 업로드
- **@nestjs/swagger**: OpenAPI 문서 생성
- **class-transformer / class-validator**: 요청 DTO 및 트래커 파라미터 매핑·검증
- **dayjs**: KST 기준 날짜 처리

### 프론트엔드 (`apps/frontend`)

- **React 19 + Vite**: UI 및 개발/빌드 도구
- **@tanstack/react-query**: 서버 상태 관리
- **MobX**: 전역 UI 상태 관리
- **antd / styled-components**: UI 컴포넌트 및 스타일링
- **@tanstack/react-table**: 테이블 UI
- **axios**: HTTP 클라이언트
- **MSW**: 개발 모드 API 목 서버
- **Vitest + Testing Library**: 테스트 (커버리지 90% 임계 강제)

### 인프라

- **Docker & Docker Compose**: 로컬 인프라 컨테이너 관리
- **PostgreSQL 17**: 관계형 데이터베이스
- **Redis (alpine)**: 캐시·스트림 서버
- **Turborepo**: 모노레포 빌드 시스템
- **pnpm 9**: 패키지 매니저

## 📁 프로젝트 구조

```
monorepo-practice/
├── apps/                          # 애플리케이션
│   ├── backend/                   # NestJS API (:3001)
│   │   ├── src/
│   │   │   ├── common/            # 순수 유틸 (date, view-code)
│   │   │   ├── infra/             # 외부 연결 어댑터
│   │   │   │   ├── cache/         # Redis 캐시 (포트/어댑터)
│   │   │   │   ├── stream/        # Redis Stream 프로듀서/컨슈머
│   │   │   │   ├── mail/          # AWS SES 메일 어댑터
│   │   │   │   ├── storage/       # AWS S3 파일 업로드 (포트/어댑터)
│   │   │   │   ├── http/          # 외부 HTTP 호출 (매체 포스트백 재전송)
│   │   │   │   └── prisma/        # Prisma 모듈/서비스
│   │   │   ├── interceptors/      # 응답 래핑 인터셉터
│   │   │   ├── modules/           # 기능 모듈 (모듈별 클린 아키텍처 4계층)
│   │   │   │   ├── auth/          # 회원가입·로그인·토큰 재발급
│   │   │   │   ├── user/          # 사용자
│   │   │   │   ├── advertiser/    # 광고주
│   │   │   │   ├── advertising/   # 광고
│   │   │   │   ├── campaign/      # 캠페인
│   │   │   │   ├── config/        # 캠페인 설정
│   │   │   │   ├── media/         # 매체
│   │   │   │   ├── tracker/       # 트래커
│   │   │   │   ├── dashboard/     # 대시보드·일별 리포트
│   │   │   │   ├── tracking/      # 트래킹 처리
│   │   │   │   ├── postback/      # 포스트백 처리
│   │   │   │   └── reservation/   # 트래커 URL 예약 변경
│   │   │   ├── trackers/          # 트래커별 파라미터 매핑 (anti-corruption)
│   │   │   ├── main.ts
│   │   │   └── main.consumer.ts   # 컨슈머 전용 엔트리포인트 (APP_ROLE=consumer)
│   │   ├── prisma/                # Prisma 스키마 및 마이그레이션
│   │   ├── http/                  # 엔드포인트별 HTTP 요청 파일
│   │   └── README.md
│   │
│   └── frontend/                  # React 어드민 (:3000)
│       ├── src/
│       │   ├── app/               # 진입점·라우팅·MobX Store·전역 스타일
│       │   ├── features/          # 기능별 화면 (home/login/signup/advertising/detail/media/tracker/developer)
│       │   ├── shared/            # 공용 api / lib / ui
│       │   └── mocks/             # MSW 핸들러
│       ├── vite.config.ts
│       └── README.md
│
├── packages/                      # 공유 패키지
│   ├── eslint-config/             # ESLint / Prettier 설정 (@repo/eslint-config)
│   │   ├── base.js
│   │   ├── nestjs.js
│   │   └── prettier.js
│   │
│   └── typescript-config/         # TypeScript 설정 (@repo/typescript-config)
│       ├── base.json
│       └── nestjs.json
│
├── infra/
│   └── terraform/                 # AWS 배포 인프라 (ECS Fargate·RDS·ElastiCache·S3+CloudFront)
│
├── docs/
│   └── migration/                 # admin-backend 이관 계획·체크리스트·맥락 메모
│
├── checklist.md                   # 진행 중 작업 체크리스트
├── context-notes.md               # 작업 결정 사항과 그 이유
├── docker-compose.yml             # Docker Compose 설정
├── turbo.json                     # Turborepo 설정
├── pnpm-workspace.yaml            # pnpm 워크스페이스 설정
└── README.md                      # 이 파일
```

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js**: >=18
- **pnpm**: >=9.0.0
- **Docker & Docker Compose**: (선택사항, 로컬 개발 시 권장)

### 설치

1. 저장소 클론

```bash
git clone <repository-url>
cd monorepo-practice
```

2. 의존성 설치

```bash
pnpm install
```

3. 각 앱에 `.env` 생성 (아래 [환경 변수 설정](#환경-변수-설정) 참고)

4. 개발 서버 실행

```bash
pnpm dev
```

`pnpm dev`가 인프라 기동(`docker:up`) → 마이그레이션 적용(`db:deploy`) → Prisma 클라이언트 생성(`db:generate`) → 테스트 데이터 주입(`db:seed`) → 앱 실행까지 한 번에 처리합니다. 종료 시 볼륨까지 정리되므로 매 기동이 빈 DB에서 시작하고, 마이그레이션과 시드가 매번 처음부터 실행됩니다.

### Docker Compose

로컬 개발용 PostgreSQL, Redis는 `pnpm dev`가 자동으로 백그라운드에 띄우고 healthcheck 통과까지 기다립니다. **dev를 종료하면(Ctrl+C) 컨테이너도 함께 내려갑니다.** 직접 다룰 때는 다음 명령을 씁니다.

```bash
# 인프라만 시작 (백그라운드, 준비될 때까지 대기)
pnpm docker:up

# 인프라 중지
pnpm docker:down
```

이 명령으로 시작되는 서비스는 다음과 같습니다.

- **PostgreSQL 17**: `localhost:5432` (DB명 `mecross`)
- **Redis**: `localhost:6379`

> ⚠️ `docker:down`은 `-v`가 붙어 있어 컨테이너와 함께 named volume(`postgres_data`, `redis_data`)까지 제거합니다. **dev를 종료할 때마다(Ctrl+C·실패 포함) DB와 Redis 데이터가 사라지므로, 화면에서 만든 광고주·캠페인 같은 작업 데이터는 유지되지 않습니다.** 매번 깨끗한 시드 상태로 시작하는 것을 의도한 설정입니다. 데이터를 남기고 내리려면 `docker compose -f ./docker-compose.yml down`을 직접 실행하세요.

### 환경 변수 설정

`.env` 파일은 gitignore되므로 각 앱에 직접 생성해야 합니다.

#### `apps/backend/.env`

```env
# 데이터베이스
DATABASE_URL="postgresql://postgres:1234@localhost:5432/mecross"

# 서버
PORT=3001

# Redis (캐시·스트림 공용) — 컨슈머 이름은 미설정 시 consumer-<호스트명>-<PID>로 자동 생성
VALKEY="redis://localhost:6379"
REDIS_STREAM_GROUP="mecross-system"

# JWT — signin·refresh 토큰 서명 키
JWT_ACCESS_SECRET="change-me-access"
JWT_REFRESH_SECRET="change-me-refresh"

# AWS SES — 회원가입 인증 코드 메일 발송
# 자격 증명은 AWS SDK 기본 체인(AWS_ACCESS_KEY_ID·AWS_SECRET_ACCESS_KEY 등)을 사용
AWS_REGION="ap-northeast-2"
SES_FROM_EMAIL="<SES에서 검증한 발신자 이메일>"

# AWS S3 — advertising 이미지 업로드 저장소 (이미지 업로드를 안 쓰면 생략 가능)
S3_BUCKET="my-bucket"

# 업로드된 이미지 URL의 접두사. 저장 시점의 절대 URL이 DB에 남으므로 배포 후 바꾸면 기존 이미지가 깨진다.
# 운영은 터라폼이 CloudFront 도메인을 주입한다(버킷이 비공개라 S3 정적 URL은 403).
# 미설정 시 S3 정적 URL로 폴백하므로 공개 버킷을 쓰는 로컬에서는 생략해도 된다.
ASSET_BASE_URL="https://asset.<도메인>"
```

> 프로세스 역할(`APP_ROLE`), rate limit, 스트림 튜닝 등 전체 환경변수 목록은 [backend README](./apps/backend/README.md)를 참고하세요.

> 회원가입은 2단계입니다. `POST /auth/signup`에 email·password를 제출하면 6자리 인증 코드가 발송되고(AWS SES, 이 시점엔 계정 미생성), `POST /auth/signup/verify`에 email·code를 제출해 검증을 통과해야 계정이 생성됩니다. SES sandbox 상태에서는 발신자뿐 아니라 수신자 이메일도 SES identity로 등록·검증되어 있어야 합니다.

#### `apps/frontend/.env`

```env
VITE_API_URL=http://localhost:3001
```

> 개발 모드에서는 MSW 목 서버가 켜지지만 핸들러에 등록된 엔드포인트만 가로채고, 나머지 요청은 실제 backend(:3001)로 통과합니다(`onUnhandledRequest: 'bypass'`). 목킹 대상은 `apps/frontend/src/mocks/handlers.ts`를 참고하세요.

### 데이터베이스 마이그레이션

일상적인 작업은 루트에서 실행합니다.

```bash
pnpm db:deploy     # 마이그레이션 적용
pnpm db:generate   # Prisma 클라이언트 재생성
pnpm db:seed       # 테스트 데이터 주입 (upsert 기반이라 재실행 안전)
pnpm db:reset      # DB 초기화 후 seed 자동 실행 (데이터 삭제됨, 로컬 전용)
```

마이그레이션 **생성**은 SQL을 검토한 뒤 적용하는 2단계 작업이라 backend에서 직접 실행합니다.

```bash
cd apps/backend
pnpm migrate       # prisma migrate dev --create-only (SQL 생성만)
# 생성된 migration.sql 검토 후
pnpm deploy
```

### 개발 서버 실행

```bash
# 전체 앱 개발 모드 (인프라·스키마 준비 후 backend·frontend 동시 기동)
pnpm dev

# 특정 앱만 실행 (준비 단계를 건너뛰고 해당 앱만 바로 실행)
pnpm dev --filter=backend
pnpm dev --filter=frontend
```

`pnpm dev`는 backend(`:3001`)와 frontend(`:3000`)를 함께 띄우고, 종료하면 Docker 컨테이너까지 정리합니다. 준비 단계가 하나라도 실패하면 앱이 기동되지 않으므로, DB 문제로 막혔지만 frontend만 작업해야 한다면 `pnpm dev --filter=frontend`를 쓰면 됩니다(MSW 목 서버로 동작).

> 터미널 두 개로 backend·frontend를 따로 돌리면 한쪽을 종료할 때 컨테이너가 내려가 다른 쪽 DB 연결이 끊어집니다. 이럴 때는 `pnpm docker:up`으로 인프라를 먼저 띄우고 각 앱을 `pnpm dev --filter=...`로 실행하세요.

개별 애플리케이션 디렉토리에서도 실행 가능합니다.

```bash
cd apps/backend
pnpm dev
```

## 📦 애플리케이션 상세

### Backend (`apps/backend`)

어드민 API와 트래킹·포스트백 처리 시스템입니다.

- **포트**: 3001
- **API 문서**: `http://localhost:3001/docs` (OpenAPI 스펙은 `/docs-json`)
- **주요 기능**: 인증, 어드민 리소스 CRUD, 트래킹 데이터 수신, 일별 집계, 포스트백 전송, Redis Stream 배치 처리
- **아키텍처**: 모듈별 클린 아키텍처 4계층 (`domain`/`application`/`infrastructure`/`presentation`). `src/` 각 폴더에 CLAUDE.md 있음.
- **HTTP 요청 파일**: `apps/backend/http/*.http`로 엔드포인트를 바로 호출 가능
- [상세 문서](./apps/backend/README.md)

### Frontend (`apps/frontend`)

광고 관리 플랫폼의 어드민 화면입니다.

- **포트**: 3000 (Vite dev server)
- **상태 관리**: 서버 상태는 react-query, 전역 UI 상태는 MobX
- **구조**: 기능 기반(`features/`) + 공용 계층(`shared/`), 경로 별칭 `@/*` → `src/*`
- **테스트**: Vitest, 커버리지 90% 임계 강제
- [상세 문서](./apps/frontend/README.md)

## 🔧 공유 패키지

### ESLint (`packages/eslint-config`)

공유 ESLint / Prettier 설정을 제공합니다.

- `@repo/eslint-config/base`: 기본 설정
- `@repo/eslint-config/nestjs`: NestJS 설정 (type-checked)
- `@repo/eslint-config/prettier`: 공유 Prettier 설정

### TypeScript (`packages/typescript-config`)

공유 TypeScript 설정을 제공합니다.

- `@repo/typescript-config/base.json`: 기본 설정
- `@repo/typescript-config/nestjs.json`: NestJS 설정

## 📝 사용 가능한 스크립트

### 루트 레벨

```bash
# 모든 앱 빌드
pnpm build

# 모든 앱 개발 모드 실행
pnpm dev

# 모든 앱 테스트
pnpm test

# 모든 앱 린트
pnpm lint

# 코드 포맷팅
pnpm format

# 타입 체크
pnpm check-types

# Docker Compose 실행 / 중지
pnpm docker:up
pnpm docker:down
```

> `pnpm check-types`는 `check-types` 스크립트가 있는 frontend만 실행합니다(`tsc --noEmit`). backend는 별도 스크립트 없이 `pnpm build`(nest build)가 타입 검사를 겸합니다.

> `pnpm format`은 루트 Prettier 기본값(2칸 스페이스, `printWidth: 80`)으로 저장소 전체를 재포맷합니다. backend는 `@repo/eslint-config/prettier`(탭, `printWidth: 180`)를 따르므로 앱 안에서 `pnpm --filter=backend format`을 쓰세요.

### 필터링

특정 앱이나 패키지만 작업합니다.

```bash
pnpm build --filter=backend
pnpm dev --filter=frontend
```

## 🧪 테스트

### Backend (Jest)

```bash
cd apps/backend

pnpm test                    # 단위 테스트
pnpm test -- -t "테스트명"    # 단일 테스트
pnpm test:cov                # 커버리지
pnpm test:e2e                # E2E (./test/jest-e2e.json)
```

### Frontend (Vitest)

```bash
cd apps/frontend

pnpm test                    # 1회 실행
pnpm test:watch              # watch 모드
pnpm test:coverage           # 커버리지 (90% 미달 시 실패)
```

## 🏗️ 빌드

프로덕션 빌드입니다.

```bash
# 전체 빌드
pnpm build

# 앱별 빌드
pnpm build --filter=backend
pnpm build --filter=frontend
```

빌드 결과물은 다음과 같습니다.

- `apps/backend/dist/`: NestJS 빌드 결과
- `apps/frontend/dist/`: Vite 빌드 결과

프론트엔드는 배포 모드별 빌드도 지원합니다.

```bash
cd apps/frontend
pnpm build:staging
pnpm build:prod
```

## 🔄 데이터베이스 마이그레이션

Prisma 마이그레이션 관리입니다.

```bash
cd apps/backend

# 새 마이그레이션 생성 (--create-only)
pnpm migrate

# 마이그레이션 적용
pnpm deploy

# 데이터베이스 초기화 (주의: 데이터 삭제, 초기화 후 seed 자동 실행)
pnpm reset

# 로컬 테스트 데이터 생성 (재실행해도 안전)
pnpm seed

# Prisma Studio (DB GUI)
npx prisma studio
```

`pnpm seed`는 역할별 계정 4개(`admin`=DEVELOPER / `ops`=ADMIN / `viewer`=USER / `pending`=미승인, 전부 `@test.com` · `test1234!`)와 광고주·트래커·매체·광고·캠페인, 최근 7일치 대시보드 통계와 포스트백 로그를 생성합니다. SES 인증 코드 수신이 어려운 로컬 환경에서 이 계정으로 바로 로그인할 수 있습니다.

스키마는 `apps/backend/prisma/schema.prisma`에 있고, datasource URL은 `prisma.config.ts`가 `DATABASE_URL`에서 주입합니다.

## 🐳 Docker

### Docker Compose 서비스

- **PostgreSQL 17**: 관계형 데이터베이스 (`monorepo-postgres`)
- **Redis (alpine)**: 캐시·스트림 서버 (`monorepo-redis`)

### 서비스 시작/중지

```bash
# 서비스 시작
pnpm docker:up

# 서비스 중지
pnpm docker:down

# 로그 확인
docker compose logs -f

# 특정 서비스만 시작
docker compose up postgres
```

## 🚀 배포

### 프로덕션 빌드

```bash
# 전체 빌드
pnpm build

# backend 실행 (API — 운영에서 분리 기동 시 APP_ROLE=api 지정)
cd apps/backend
pnpm start:prod

# backend 컨슈머 프로세스 실행 (Redis Stream 소비 전용)
pnpm start:consumer

# frontend 정적 결과물 확인
cd apps/frontend
pnpm preview
```

### AWS 배포

ECS Fargate·RDS PostgreSQL·ElastiCache Valkey·S3+CloudFront 구성의 Terraform 코드가 `infra/terraform/`에 있습니다. 아키텍처·비용·배포 절차는 [infra/terraform/README.md](./infra/terraform/README.md)를 참고하세요.

## 🤝 기여 가이드

1. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
2. 변경사항 커밋 (커밋 메시지는 한글로 작성)
3. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
4. Pull Request 생성

### 코드 스타일

- ESLint 규칙 준수
- backend는 `@repo/eslint-config/prettier` 적용 (탭 들여쓰기, `printWidth: 180`, 세미콜론, single quote)
- TypeScript strict 유지
- 프론트엔드 파일·폴더명은 kebab-case, 컴포넌트·타입 export는 PascalCase

```bash
# 린트 확인
pnpm lint

# 포맷팅 — 수정한 앱의 설정을 따르도록 앱 단위로 실행
pnpm --filter=backend format
```

## 📄 라이선스

UNLICENSED

## 🔗 관련 링크

- [Turborepo 문서](https://turborepo.org/docs)
- [NestJS 문서](https://docs.nestjs.com)
- [Prisma 문서](https://www.prisma.io/docs)
- [Vite 문서](https://vite.dev)
- [TanStack Query 문서](https://tanstack.com/query/latest)

## 📞 지원

프로젝트 관련 문의사항이나 이슈가 있으면 GitHub Issues를 활용해주세요.
