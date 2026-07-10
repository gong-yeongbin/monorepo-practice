# Monorepo Practice

광고 관리 플랫폼의 모노레포 프로젝트입니다. Turborepo를 기반으로 관리자 API, 관리자 페이지, 트래킹 시스템을 포함한 모노레포 구성입니다.

## 📋 프로젝트 개요

이 프로젝트는 광고주, 광고, 캠페인, 매체, 트래커를 관리하고, 다양한 트래킹 솔루션으로부터의 트래킹 데이터를 처리하는 통합 플랫폼입니다.

### 주요 기능

- **광고 관리**: 광고주, 광고, 캠페인 관리 및 통계 조회
- **트래킹 처리**: 다양한 트래킹 솔루션 (AppsFlyer, Adjust, Airbridge, AdbrixRemaster) 지원
- **포스트백 전송**: 매체사로 포스트백 자동 전송
- **대시보드**: 실시간 통계 시각화 및 관리

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Monorepo (Turborepo)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  admin-page  │  │    admin     │  │   backend    │      │
│  │  (Vue 3)     │  │  (NestJS)    │  │  (NestJS)    │      │
│  │  :5173       │  │  :3000       │  │  :3001       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         │ GraphQL          │ Prisma           │ Kafka        │
│         │                  │                  │ Redis        │
│         └──────────────────┼──────────────────┘              │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │   MySQL (Prisma)│                        │
│                   └─────────────────┘                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   prisma     │  │    eslint    │  │  ts-config   │      │
│  │   (shared)   │  │   (shared)   │  │   (shared)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ 기술 스택

### 프론트엔드

- **Vue 3.5**: 컴포넌트 기반 프레임워크
- **Vite**: 빠른 빌드 도구
- **PrimeVue**: UI 컴포넌트 라이브러리
- **Pinia**: 상태 관리
- **Apollo Client**: GraphQL 클라이언트
- **Vue Router**: 라우팅

### 백엔드

- **NestJS 11**: Node.js 프레임워크
- **GraphQL**: API 쿼리 언어 (Apollo Server)
- **Prisma**: ORM 및 데이터베이스 관리
- **Passport.js**: 인증 미들웨어
- **Kafka**: 메시지 큐
- **Redis (Valkey)**: 캐시 및 세션 저장소

### 인프라

- **Docker & Docker Compose**: 컨테이너 관리
- **MySQL**: 관계형 데이터베이스
- **Turborepo**: 모노레포 빌드 시스템
- **pnpm**: 패키지 매니저

## 📁 프로젝트 구조

```
monorepo-practice/
├── apps/                          # 애플리케이션
│   ├── admin/                     # GraphQL API 서버
│   │   ├── src/
│   │   │   ├── module/            # 기능 모듈
│   │   │   │   ├── advertiser/   # 광고주 관리
│   │   │   │   ├── advertising/   # 광고 관리
│   │   │   │   ├── campaign/      # 캠페인 관리
│   │   │   │   ├── media/         # 매체 관리
│   │   │   │   ├── tracker/       # 트래커 관리
│   │   │   │   ├── user/          # 사용자 관리
│   │   │   │   └── auth/          # 인증
│   │   │   └── main.ts
│   │   └── README.md
│   │
│   ├── admin-page/                # Vue 3 프론트엔드
│   │   ├── src/
│   │   │   ├── views/             # 페이지 컴포넌트
│   │   │   ├── stores/            # Pinia 스토어
│   │   │   ├── components/        # 재사용 컴포넌트
│   │   │   └── router/            # 라우팅 설정
│   │   └── README.md
│   │
│   ├── backend/                   # 트래킹 시스템
│   │   ├── src/
│   │   │   ├── module/            # 기능 모듈 (모듈별 클린 아키텍처 레이어)
│   │   │   │   ├── tracking/      # 트래킹 처리 (application/presentation)
│   │   │   │   ├── postback/      # 포스트백 처리 (application/infrastructure/presentation)
│   │   │   │   └── campaign/      # 공유 캠페인 도메인 (domain/infrastructure)
│   │   │   ├── core/              # 공유 인프라 (포트 + 어댑터)
│   │   │   │   ├── kafka/         # Kafka 모듈
│   │   │   │   └── cache/         # Redis 캐시
│   │   │   └── main.ts
│   │   └── README.md
│   │
│   └── README.md                  # Apps 개요 문서
│
├── packages/                      # 공유 패키지
│   ├── prisma/                    # Prisma 스키마 및 클라이언트
│   │   ├── prisma/
│   │   │   └── schema.prisma      # 데이터베이스 스키마
│   │   └── prisma.service.ts
│   │
│   ├── eslint/                    # ESLint 설정
│   │   ├── base.js                # 기본 설정
│   │   └── nest.js                # NestJS 설정
│   │
│   └── typescript-config/         # TypeScript 설정
│       ├── base.json              # 기본 설정
│       └── nestjs.json            # NestJS 설정
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
cd packages/prisma
pnpm generate
cd ../..
```

### Docker Compose 실행 (선택사항)

로컬 개발을 위해 MySQL, Redis, Kafka를 Docker로 실행:

```bash
# Docker Compose로 인프라 시작
pnpm docker:up

# Docker Compose 중지
pnpm docker:down
```

이 명령은 다음 서비스를 시작합니다:

- **MySQL**: `localhost:3306`
- **Redis (Valkey)**: `localhost:6379`
- **Kafka**: `localhost:9092`

### 환경 변수 설정

각 애플리케이션 디렉토리에 `.env` 파일을 생성하세요:

#### `apps/admin/.env`

```env
DATABASE_URL="mysql://root:1234@localhost:3306/mecross"
PORT=3000
CLIENT="http://localhost:5173"
JWT_SECRET="your-secret-key"
```

#### `apps/admin-page/.env`

```env
VITE_GRAPHQL_URL="http://localhost:3000/graphql"
```

#### `apps/backend/.env`

```env
DATABASE_URL="mysql://root:1234@localhost:3306/mecross"
PORT=3001
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="system-api"
KAFKA_GROUP_ID="system-api-group"
REDIS_URL="redis://localhost:6379"
```

### 데이터베이스 마이그레이션

```bash
cd packages/prisma

# 개발 환경 마이그레이션
pnpm migrate

# 또는 프로덕션 배포
pnpm deploy
```

### 개발 서버 실행

모든 애플리케이션을 동시에 실행:

```bash
pnpm dev
```

특정 애플리케이션만 실행:

```bash
# Admin API만 실행
pnpm turbo dev --filter=admin

# Admin Page만 실행
pnpm turbo dev --filter=admin-page

# Backend만 실행
pnpm turbo dev --filter=backend
```

개별 애플리케이션 디렉토리에서도 실행 가능:

```bash
cd apps/admin
pnpm dev

cd apps/admin-page
pnpm dev

cd apps/backend
pnpm dev
```

## 📦 애플리케이션 상세

### Admin API (`apps/admin`)

GraphQL API 서버로 광고 관리 기능을 제공합니다.

- **포트**: 3000
- **엔드포인트**: `http://localhost:3000/graphql`
- **주요 기능**: 인증, CRUD 작업, 통계 조회
- [상세 문서](./apps/admin/README.md)

### Admin Page (`apps/admin-page`)

Vue 3 기반 관리자 대시보드입니다.

- **포트**: 5173 (개발), 4173 (프리뷰)
- **URL**: `http://localhost:5173`
- **주요 기능**: 대시보드, 통계 시각화, 설정 관리
- [상세 문서](./apps/admin-page/README.md)

### Backend (`apps/backend`)

트래킹 및 포스트백 처리 시스템입니다.

- **포트**: 3001
- **주요 기능**: 트래킹 데이터 수신, 포스트백 전송, 메시지 큐 처리
- [상세 문서](./apps/backend/README.md)

## 🔧 공유 패키지

### Prisma (`packages/prisma`)

데이터베이스 스키마와 Prisma 클라이언트를 관리합니다.

```bash
cd packages/prisma

# Prisma 클라이언트 생성
pnpm generate

# 마이그레이션 생성
pnpm migrate

# 마이그레이션 적용
pnpm deploy
```

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

# 모든 앱 린트
pnpm lint

# 코드 포맷팅
pnpm format

# 타입 체크
pnpm check-types

# Docker Compose 실행
pnpm docker:up

# Docker Compose 중지
pnpm docker:down
```

### 필터링

특정 앱이나 패키지만 작업:

```bash
# 특정 앱 빌드
pnpm turbo build --filter=admin

# 특정 앱 개발
pnpm turbo dev --filter=admin-page

# 여러 앱 동시 작업
pnpm turbo build --filter=admin --filter=backend
```

## 🧪 테스트

```bash
# 모든 앱 테스트
pnpm turbo test

# 특정 앱 테스트
pnpm turbo test --filter=admin

# E2E 테스트
cd apps/admin
pnpm test:e2e
```

## 🏗️ 빌드

프로덕션 빌드:

```bash
# 모든 앱 빌드
pnpm build

# 특정 앱만 빌드
pnpm turbo build --filter=admin-page
```

빌드 결과물:

- `apps/admin/dist/`: NestJS 빌드 결과
- `apps/admin-page/dist/`: Vue 정적 파일
- `apps/backend/dist/`: NestJS 빌드 결과

## 📚 문서

- [Apps 개요](./apps/README.md) - 애플리케이션 전체 개요
- [Admin API 문서](./apps/admin/README.md) - GraphQL API 상세
- [Admin Page 문서](./apps/admin-page/README.md) - 프론트엔드 상세
- [Backend 문서](./apps/backend/README.md) - 트래킹 시스템 상세

## 🔐 인증 및 보안

- **인증 방식**: Passport.js (Local Strategy)
- **세션 관리**: Cookie 기반
- **JWT**: 토큰 기반 인증
- **CORS**: 설정된 Origin만 허용

## 🔄 데이터베이스 마이그레이션

Prisma 마이그레이션 관리:

```bash
cd packages/prisma

# 새 마이그레이션 생성
pnpm migrate

# 프로덕션 환경 마이그레이션
pnpm deploy

# 데이터베이스 초기화 (주의: 데이터 삭제)
pnpm reset

# Prisma Studio (DB GUI)
npx prisma studio
```

## 🐳 Docker

### Docker Compose 서비스

- **MySQL 8.0**: 관계형 데이터베이스
- **Valkey**: Redis 호환 캐시 서버
- **Kafka**: 메시지 큐 브로커

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

# 환경 변수 설정 후 실행
cd apps/admin
pnpm start:prod
```

### 개별 배포

각 애플리케이션은 독립적으로 배포 가능:

- **admin**: NestJS 애플리케이션 (Node.js 환경)
- **admin-page**: 정적 파일 (CDN 또는 웹 서버)
- **backend**: NestJS 애플리케이션 (Node.js 환경)

## 🤝 기여 가이드

1. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
2. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
3. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
4. Pull Request 생성

### 코드 스타일

- ESLint 규칙 준수
- Prettier 포맷팅 적용
- TypeScript 타입 안정성 유지

```bash
# 린트 확인
pnpm lint

# 자동 수정
pnpm lint --fix

# 포맷팅
pnpm format
```

## 📄 라이선스

UNLICENSED

## 🔗 관련 링크

- [Turborepo 문서](https://turborepo.org/docs)
- [NestJS 문서](https://docs.nestjs.com)
- [Vue 3 문서](https://vuejs.org)
- [Prisma 문서](https://www.prisma.io/docs)
- [Apollo GraphQL](https://www.apollographql.com/docs)

## 📞 지원

프로젝트 관련 문의사항이나 이슈가 있으면 GitHub Issues를 활용해주세요.
