# Admin API

관리자용 GraphQL API 서버입니다. 광고주, 광고, 캠페인, 매체, 트래커, 사용자 관리를 위한 GraphQL API를 제공합니다.

## 기술 스택

- **Framework**: NestJS 11.x
- **API**: GraphQL (Apollo Server)
- **Authentication**: Passport.js (Local Strategy, JWT)
- **Database**: Prisma (공유 패키지 사용)
- **Language**: TypeScript

## 프로젝트 구조

```
src/
├── main.ts                    # 애플리케이션 진입점
├── app.module.ts              # 루트 모듈
├── common/                    # 공통 모듈
│   ├── guard/                 # 인증/인가 가드
│   └── interceptor/           # 인터셉터
└── module/                    # 기능 모듈
    ├── advertiser/            # 광고주 관리
    ├── advertising/           # 광고 관리
    ├── auth/                  # 인증
    ├── campaign/              # 캠페인 관리
    ├── media/                 # 매체 관리
    ├── tracker/               # 트래커 관리
    └── user/                  # 사용자 관리
```

## 주요 기능

### 인증 및 인가

- 로컬 인증 (Passport Local Strategy)
- JWT 토큰 기반 인증
- GraphQL 인증 가드
- 쿠키 기반 세션 관리

### 광고주 관리

- 광고주 생성, 조회, 수정
- 광고주별 광고 목록 조회

### 광고 관리

- 광고 생성, 조회, 수정
- 광고별 캠페인 목록 조회
- 광고 통계 조회

### 캠페인 관리

- 캠페인 생성, 조회, 수정
- 캠페인별 일일 통계 조회
- 캠페인 설정 (Config) 관리
- 캠페인 활성화/비활성화

### 매체 관리

- 매체 목록 조회
- 매체별 포스트백 URL 관리

### 트래커 관리

- 트래커 목록 조회
- 트래커별 설정 관리

### 사용자 관리

- 사용자 조회
- 사용자 권한 관리

## 설치 및 실행

### 의존성 설치

```bash
pnpm install
```

### 개발 환경 실행

```bash
# 개발 모드 (watch 모드)
pnpm run dev

# 디버그 모드
pnpm run start:debug

# 프로덕션 모드
pnpm run start:prod
```

### 빌드

```bash
pnpm run build
```

## 환경 변수

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET="your-secret-key"

# GraphQL
GRAPHQL_PORT=3000
```

## GraphQL API

### 주요 쿼리

#### 로그인

```graphql
mutation {
	login(userId: "user@example.com", password: "password")
}
```

#### 광고 목록 조회

```graphql
query {
	advertisings {
		id
		name
		image
		advertiser
		tracker
		campaign {
			id
			name
			token
		}
	}
}
```

#### 캠페인 상세 조회

```graphql
query {
	advertising(id: 1) {
		id
		name
		campaign {
			id
			name
			token
			type
			isActive
			dailyStatistic(startDate: "2024-01-01", endDate: "2024-01-31") {
				click
				install
				registration
				purchase
				revenue
				createdDate
			}
		}
	}
}
```

#### 캠페인 설정 업데이트

```graphql
mutation {
	upsertCampaignConfig(campaignId: 1, input: [{ sendMedia: true, trackerEventName: "install", adminEventName: "install", mediaEventName: "install_event" }]) {
		campaignId
		sendMedia
		trackerEventName
		adminEventName
		mediaEventName
	}
}
```

## 테스트

```bash
# 단위 테스트
pnpm run test

# E2E 테스트
pnpm run test:e2e

# 커버리지
pnpm run test:cov

# Watch 모드
pnpm run test:watch
```

## 코드 포맷팅 및 린트

```bash
# 코드 포맷팅
pnpm run format

# 린트
pnpm run lint
```

## 아키텍처

이 프로젝트는 Clean Architecture 패턴을 따릅니다:

- **Domain Layer**: 엔티티 및 리포지토리 인터페이스
- **Infrastructure Layer**: Prisma를 사용한 리포지토리 구현
- **Use Case Layer**: 비즈니스 로직
- **Controller Layer**: GraphQL Resolver

## 라이선스

UNLICENSED
