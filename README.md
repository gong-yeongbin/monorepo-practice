# Monorepo Practice

광고 관리 플랫폼의 트래킹·포스트백 시스템입니다. Turborepo 기반 모노레포로 구성되어 있으며, 현재 애플리케이션은 `apps/backend` 하나입니다. (과거 `admin` GraphQL API와 `admin-page` Vue 프론트엔드가 있었으나 `f2b1851`에서 제거되었습니다.)

## 📋 프로젝트 개요

광고주, 광고, 캠페인, 매체, 트래커를 다루는 플랫폼의 트래킹 데이터 처리 백엔드입니다. 다양한 트래킹 솔루션으로부터 클릭·설치·이벤트 데이터를 수신해 집계하고 매체사로 포스트백을 전송합니다.

### 주요 기능

- **트래킹 처리**: 다양한 트래킹 솔루션 (AppsFlyer, Adjust, Airbridge, AdbrixRemaster) 지원
- **포스트백 전송**: 매체사로 포스트백 전송
- **일별 집계**: `daily_report`로 클릭/설치/이벤트/매출 등을 KST 기준 일별 집계
- **비동기 메시징**: Redis Stream 기반 consumer group으로 트래킹·포스트백 배치 처리

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Monorepo (Turborepo)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                   ┌──────────────┐                            │
│                   │   backend    │                            │
│                   │  (NestJS)    │                            │
│                   │  :3001       │                            │
│                   └──────┬───────┘                            │
│                          │                                    │
│              Prisma ─────┼───── Redis Stream / Cache          │
│                          │      (ioredis / Valkey)            │
│                 ┌────────▼────────┐                           │
│                 │   MySQL (Prisma)│                           │
│                 └─────────────────┘                           │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │ eslint-config│  │ ts-config    │                          │
│  │   (shared)   │  │   (shared)   │                          │
│  └──────────────┘  └──────────────┘                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ 기술 스택

### 백엔드 (`apps/backend`)

- **NestJS 11**: Node.js 프레임워크
- **Prisma 7**: ORM 및 데이터베이스 관리 (MySQL/MariaDB driver adapter)
- **ioredis**: Redis Stream(비동기 메시징) + Redis 캐시 클라이언트
- **class-transformer / class-validator**: 트래커 파라미터 매핑·검증
- **dayjs**: KST 기준 날짜 처리

### 인프라

- **Docker & Docker Compose**: 컨테이너 관리
- **MySQL**: 관계형 데이터베이스
- **Valkey**: Redis 호환 캐시·스트림 서버
- **Turborepo**: 모노레포 빌드 시스템
- **pnpm**: 패키지 매니저

## 📁 프로젝트 구조

```
monorepo-practice/
├── apps/                          # 애플리케이션
│   └── backend/                   # 트래킹·포스트백 시스템
│       ├── src/
│       │   ├── common/            # 순수 유틸 (date, view-code)
│       │   ├── infra/             # 외부 연결 어댑터
│       │   │   ├── cache/         # Redis 캐시 (포트/어댑터)
│       │   │   ├── stream/        # Redis Stream 프로듀서/컨슈머
│       │   │   └── prisma/        # Prisma 모듈/서비스
│       │   ├── modules/           # 기능 모듈 (모듈별 클린 아키텍처 4계층)
│       │   │   ├── tracking/      # 트래킹 처리 (domain/application/infrastructure/presentation)
│       │   │   └── postback/      # 포스트백 처리 (domain/application/infrastructure/presentation)
│       │   ├── trackers/          # 트래커별 파라미터 매핑 (anti-corruption)
│       │   └── main.ts
│       ├── prisma/                # Prisma 스키마 및 마이그레이션
│       │   └── schema.prisma
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

로컬 개발을 위해 MySQL, Valkey를 Docker로 실행:

```bash
# Docker Compose로 인프라 시작
pnpm docker:up

# Docker Compose 중지
pnpm docker:down
```

이 명령은 다음 서비스를 시작합니다:

- **MySQL**: `localhost:3306`
- **Valkey (Redis)**: `localhost:6379`

> compose 파일에는 Kafka 컨테이너도 남아있으나 현재 코드는 사용하지 않습니다(비동기 메시징은 Redis Stream으로 전환됨).

### 환경 변수 설정

`apps/backend`에 `.env` 파일을 생성하세요:

#### `apps/backend/.env`

```env
DATABASE_URL="mysql://root:1234@localhost:3306/mecross"
PORT=3001
VALKEY="redis://localhost:6379"
REDIS_STREAM_GROUP="mecross-system"
REDIS_STREAM_CONSUMER="consumer-1"
AWS_REGION="ap-northeast-2"
AWS_ACCESS_KEY_ID="<ses:SendEmail 권한을 가진 IAM access key>"
AWS_SECRET_ACCESS_KEY="<IAM secret key>"
SES_FROM_EMAIL="<SES에서 검증한 발신자 이메일>"
```

> 회원가입은 2단계입니다. `POST /user`에 email·password를 제출하면 6자리 인증 코드가 발송되고(AWS SES, 이 시점엔 계정 미생성), `POST /user/verify`에 email·code를 제출해 검증을 통과해야 계정이 생성됩니다. SES sandbox 상태에서는 발신자뿐 아니라 수신자 이메일도 SES identity로 등록·검증되어 있어야 합니다.

### 데이터베이스 마이그레이션

```bash
cd apps/backend

# 개발 환경 마이그레이션
pnpm migrate

# 또는 프로덕션 배포
pnpm deploy
```

### 개발 서버 실행

```bash
# 전체 앱 개발 모드
pnpm dev

# backend만 실행
pnpm turbo dev --filter=backend
```

개별 애플리케이션 디렉토리에서도 실행 가능:

```bash
cd apps/backend
pnpm dev
```

## 📦 애플리케이션 상세

### Backend (`apps/backend`)

트래킹 및 포스트백 처리 시스템입니다.

- **포트**: 3001
- **주요 기능**: 트래킹 데이터 수신, 일별 집계, 포스트백 전송, Redis Stream 배치 처리
- **아키텍처**: 클린 아키텍처 4계층 (`domain`/`application`/`infrastructure`/`presentation`). `src/` 각 폴더에 CLAUDE.md 있음.
- [상세 문서](./apps/backend/README.md)

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
# backend 빌드
pnpm turbo build --filter=backend

# backend 개발
pnpm turbo dev --filter=backend
```

## 🧪 테스트

```bash
cd apps/backend

# 단위 테스트
pnpm test

# 단일 테스트
pnpm test -- -t "테스트명"

# E2E 테스트
pnpm test:e2e
```

## 🏗️ 빌드

프로덕션 빌드:

```bash
# 전체 빌드
pnpm build

# backend만 빌드
pnpm turbo build --filter=backend
```

빌드 결과물:

- `apps/backend/dist/`: NestJS 빌드 결과

## 🔄 데이터베이스 마이그레이션

Prisma 마이그레이션 관리:

```bash
cd apps/backend

# 새 마이그레이션 생성 (--create-only)
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
- **Valkey**: Redis 호환 캐시·스트림 서버

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
cd apps/backend
pnpm start:prod
```

## 🤝 기여 가이드

1. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
2. 변경사항 커밋 (커밋 메시지는 한글로 작성)
3. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
4. Pull Request 생성

### 코드 스타일

- ESLint 규칙 준수
- Prettier 포맷팅 적용 (backend: 탭 들여쓰기, `printWidth: 180`, 세미콜론, single quote)
- TypeScript 타입 안정성 유지

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

## 📞 지원

프로젝트 관련 문의사항이나 이슈가 있으면 GitHub Issues를 활용해주세요.
