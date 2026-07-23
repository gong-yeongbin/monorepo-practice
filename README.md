# Monorepo Practice

광고 관리 플랫폼(광고주/광고/캠페인/매체/트래커)과 트래킹·포스트백 시스템입니다. pnpm + Turborepo 기반 모노레포이며, 애플리케이션은 `apps/backend`(NestJS API)와 `apps/frontend`(React 어드민) 두 개입니다.

## 📋 프로젝트 개요

광고주, 광고, 캠페인, 매체, 트래커를 관리하는 어드민 API와 화면, 그리고 트래킹 데이터 처리 백엔드로 구성됩니다. 다양한 트래킹 솔루션으로부터 클릭·설치·이벤트 데이터를 수신해 집계하고 매체사로 포스트백을 전송합니다.

### 주요 기능

- **어드민 리소스 관리**: 광고주·광고·캠페인·매체·트래커·파트너 CRUD와 대시보드 조회
- **인증**: 이메일 인증 코드 기반 2단계 회원가입 + JWT access/refresh 토큰
- **트래킹 처리**: 다양한 트래킹 솔루션(AppsFlyer, Adjust, Airbridge, AdbrixRemaster) 지원
- **포스트백 전송**: 매체사로 포스트백 전송
- **일별 집계**: `daily_report`로 클릭/설치/이벤트/매출 등을 KST 기준 일별 집계
- **비동기 메시징**: Redis Stream 기반 consumer group으로 트래킹·포스트백 배치 처리
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
│                                  │  MySQL (Prisma) │           │
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
- **Prisma 7**: ORM 및 데이터베이스 관리 (`@prisma/adapter-mariadb` driver adapter)
- **ioredis**: Redis Stream(비동기 메시징) + Redis 캐시 클라이언트
- **@nestjs/jwt / bcrypt**: JWT access·refresh 토큰과 비밀번호 해싱
- **@aws-sdk/client-ses**: 회원가입 인증 코드 메일 발송
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
- **MySQL 8.0**: 관계형 데이터베이스
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
│   │   │   │   ├── partner/       # 파트너
│   │   │   │   ├── dashboard/     # 대시보드·일별 리포트
│   │   │   │   ├── tracking/      # 트래킹 처리
│   │   │   │   └── postback/      # 포스트백 처리
│   │   │   ├── trackers/          # 트래커별 파라미터 매핑 (anti-corruption)
│   │   │   └── main.ts
│   │   ├── prisma/                # Prisma 스키마 및 마이그레이션
│   │   ├── http/                  # 엔드포인트별 HTTP 요청 파일
│   │   └── README.md
│   │
│   └── frontend/                  # React 어드민 (:3000)
│       ├── src/
│       │   ├── app/               # 진입점·라우팅·MobX Store·전역 스타일
│       │   ├── features/          # 기능별 화면 (home/login/advertising/detail/media/tracker/developer)
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

3. Prisma 클라이언트 생성

```bash
cd apps/backend
pnpm generate
cd ../..
```

### Docker Compose 실행 (선택사항)

로컬 개발을 위해 MySQL, Redis를 Docker로 실행합니다.

```bash
# Docker Compose로 인프라 시작
pnpm docker:up

# Docker Compose 중지
pnpm docker:down
```

이 명령으로 시작되는 서비스는 다음과 같습니다.

- **MySQL 8.0**: `localhost:3306` (DB명 `mecross`)
- **Redis**: `localhost:6379`

### 환경 변수 설정

`.env` 파일은 gitignore되므로 각 앱에 직접 생성해야 합니다.

#### `apps/backend/.env`

```env
# 데이터베이스
DATABASE_URL="mysql://root:1234@localhost:3306/mecross"

# 서버
PORT=3001

# Redis (캐시·스트림 공용)
VALKEY="redis://localhost:6379"
REDIS_STREAM_GROUP="mecross-system"
REDIS_STREAM_CONSUMER="consumer-1"

# JWT — signin·refresh 토큰 서명 키
JWT_ACCESS_SECRET="change-me-access"
JWT_REFRESH_SECRET="change-me-refresh"

# AWS SES — 회원가입 인증 코드 메일 발송
# 자격 증명은 AWS SDK 기본 체인(AWS_ACCESS_KEY_ID·AWS_SECRET_ACCESS_KEY 등)을 사용
AWS_REGION="ap-northeast-2"
SES_FROM_EMAIL="<SES에서 검증한 발신자 이메일>"
```

> 회원가입은 2단계입니다. `POST /auth/signup`에 email·password를 제출하면 6자리 인증 코드가 발송되고(AWS SES, 이 시점엔 계정 미생성), `POST /auth/signup/verify`에 email·code를 제출해 검증을 통과해야 계정이 생성됩니다. SES sandbox 상태에서는 발신자뿐 아니라 수신자 이메일도 SES identity로 등록·검증되어 있어야 합니다.

#### `apps/frontend/.env`

```env
VITE_API_URL=http://localhost:3001
VITE_USER_POOL_ID_ADVERTISER=<Cognito user pool id>
VITE_USER_POOL_ID_PARTNER=<Cognito user pool id>
VITE_USER_POOL_CLIENT_ID_ADVERTISER=<Cognito client id>
VITE_USER_POOL_CLIENT_ID_PARTNER=<Cognito client id>
```

> 개발 모드에서는 MSW 목 서버가 항상 켜져 요청을 가로챕니다. 실제 backend에 붙이려면 `src/app/index.tsx`의 `import.meta.env.DEV` 분기를 우회해야 합니다. 자세한 내용은 [frontend README](./apps/frontend/README.md)를 참고하세요.

### 데이터베이스 마이그레이션

```bash
cd apps/backend

# 마이그레이션 생성 (--create-only)
pnpm migrate

# 마이그레이션 적용
pnpm deploy
```

### 개발 서버 실행

```bash
# 전체 앱 개발 모드
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=backend
pnpm dev --filter=frontend
```

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

`pnpm seed`는 로그인 가능한 계정(`admin@test.com` / `test1234!`)과 광고주·트래커·매체·광고·캠페인, 최근 7일치 대시보드 통계를 생성합니다. SES 인증 코드 수신이 어려운 로컬 환경에서 이 계정으로 바로 로그인할 수 있습니다.

스키마는 `apps/backend/prisma/schema.prisma`에 있고, datasource URL은 `prisma.config.ts`가 `DATABASE_URL`에서 주입합니다.

## 🐳 Docker

### Docker Compose 서비스

- **MySQL 8.0**: 관계형 데이터베이스 (`monorepo-mysql`)
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
docker compose up mysql
```

## 🚀 배포

### 프로덕션 빌드

```bash
# 전체 빌드
pnpm build

# backend 실행
cd apps/backend
pnpm start:prod

# frontend 정적 결과물 확인
cd apps/frontend
pnpm preview
```

## 🤝 기여 가이드

1. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
2. 변경사항 커밋 (커밋 메시지는 한글로 작성)
3. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
4. Pull Request 생성

### 코드 스타일

- ESLint 규칙 준수
- Prettier 포맷팅 적용 (탭 들여쓰기, `printWidth: 180`, 세미콜론, single quote)
- TypeScript strict 유지
- 프론트엔드 파일·폴더명은 kebab-case, 컴포넌트·타입 export는 PascalCase

```bash
# 린트 확인
pnpm lint

# 포맷팅
pnpm format
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
