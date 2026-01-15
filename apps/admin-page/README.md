# Admin Page

광고 관리 플랫폼의 관리자 대시보드 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Framework**: Vue 3.5.x
- **Build Tool**: Vite (Rolldown)
- **UI Library**: PrimeVue 4.x
- **State Management**: Pinia 3.x
- **Routing**: Vue Router 4.x
- **GraphQL Client**: Apollo Client 3.x
- **Date Utility**: Day.js
- **Language**: TypeScript

## 프로젝트 구조

```
src/
├── main.ts                    # 애플리케이션 진입점
├── App.vue                    # 루트 컴포넌트
├── apollo-client.ts           # Apollo Client 설정
├── components/                # 재사용 컴포넌트
│   ├── Header.vue            # 헤더 컴포넌트
│   └── Sidebar.vue           # 사이드바 컴포넌트
├── layouts/                   # 레이아웃 컴포넌트
│   └── DefaultLayout.vue     # 기본 레이아웃
├── router/                    # 라우팅 설정
│   └── index.ts              # 라우터 정의
├── stores/                    # Pinia 스토어
│   ├── advertisingStore.ts   # 광고 스토어
│   ├── campaignStore.ts      # 캠페인 스토어
│   ├── dashboardStore.ts     # 대시보드 스토어
│   ├── mediaListStore.ts     # 매체 목록 스토어
│   ├── trackerListStore.ts   # 트래커 목록 스토어
│   └── userStore.ts          # 사용자 스토어
└── views/                     # 페이지 컴포넌트
    ├── LoginView.vue         # 로그인 페이지
    ├── DashBoardView.vue     # 대시보드
    ├── AdvertisingListView.vue    # 광고 목록
    ├── AdvertisingDetailView.vue  # 광고 상세
    ├── CampaignView.vue      # 캠페인 목록
    ├── CampaignConfigView.vue     # 캠페인 설정
    ├── MediaView.vue         # 매체별 통계
    ├── MediaDetailView.vue   # 매체별 상세 통계
    ├── MediaListView.vue     # 매체 목록
    └── TrackerListView.vue   # 트래커 목록
```

## 주요 기능

### 대시보드
- 광고별 통계 현황 조회
- 날짜별 필터링
- 광고별 일일 통계 (click, install, registration, purchase, revenue 등)

### 광고 관리
- 광고 목록 조회
- 광고 상세 정보 조회
- 광고별 캠페인 관리
- 캠페인 등록/수정

### 캠페인 관리
- 캠페인 목록 및 통계 조회
- 캠페인별 일일 통계 조회
- 캠페인 설정 관리 (이벤트 매핑)
- 캠페인 활성화/비활성화

### 매체 관리
- 매체별 통계 조회
- 매체별 일일/상세 통계 조회
- 매체 목록 관리

### 트래커 관리
- 트래커 목록 조회
- 트래커 설정 관리

## 설치 및 실행

### 의존성 설치

```bash
pnpm install
```

### 개발 환경 실행

```bash
pnpm dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
# 타입 체크 + 빌드
pnpm build

# 타입 체크만
pnpm type-check

# 빌드만
pnpm build-only
```

### 프로덕션 미리보기

```bash
pnpm preview
```

## 환경 설정

### Apollo Client 설정

`src/apollo-client.ts`에서 GraphQL 서버 엔드포인트를 설정하세요:

```typescript
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql', // Admin API 엔드포인트
  credentials: 'include', // 쿠키 인증
})
```

## 코드 포맷팅 및 린트

```bash
# 린트 (oxlint + eslint)
pnpm lint

# 코드 포맷팅
pnpm format
```

## 주요 컴포넌트 및 페이지

### DashBoardView
- 광고별 통계 대시보드
- 날짜 선택기로 기간 필터링
- 광고 클릭 시 캠페인 상세 페이지로 이동

### CampaignView
- 광고별 캠페인 목록
- 캠페인별 통계 조회
- 날짜 범위 선택으로 통계 조회
- 캠페인 클릭 시 매체별 통계 페이지로 이동

### CampaignConfigView
- 캠페인 설정 관리
- 이벤트 매핑 설정 (트래커 이벤트 ↔ 어드민 이벤트 ↔ 매체 이벤트)
- 트래커 트래킹 URL 확인
- MECROSS 트래킹 URL 확인

### MediaView
- 매체별 일일 통계 (날짜별 집계)
- 날짜 범위 선택 (기본: 7일 전 ~ 오늘)
- 상세 버튼으로 일별 상세 통계 확인

### MediaDetailView
- 매체별 상세 통계 (원본 데이터)
- viewCode, pubId, subId 포함
- 특정 날짜 필터링

## 상태 관리 (Pinia)

### Store 구조

각 스토어는 다음 구조를 따릅니다:

- **state**: 상태 데이터
- **getters**: 계산된 속성
- **actions**: 비동기 작업 (GraphQL 쿼리/뮤테이션)

### 주요 스토어

#### campaignStore
- 캠페인 데이터 및 통계 관리
- 캠페인 설정 (Config) CRUD
- 날짜별 통계 캐싱

#### dashboardStore
- 대시보드 데이터 관리
- 광고별 통계 집계

#### advertisingStore
- 광고 목록 관리

## 라우팅

### 주요 라우트

- `/login` - 로그인
- `/dashboard` - 대시보드
- `/advertising` - 광고 목록
- `/advertising/:id` - 광고 상세
- `/campaign` - 캠페인 목록 (query: `advertisingId`, `baseDate`)
- `/campaign/:id/config` - 캠페인 설정 (query: `advertisingId`)
- `/media/:token` - 매체별 통계 (query: `advertisingId`, `baseDate`)
- `/media/:token/detail` - 매체별 상세 통계 (query: `advertisingId`, `baseDate`, `date`)

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 권장 IDE 설정

### VS Code

- [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- Vetur 비활성화 필요

### 브라우저 확장

- [Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

## 라이선스

UNLICENSED
