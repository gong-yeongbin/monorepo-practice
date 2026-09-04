# Frontend

광고 관리 플랫폼(광고주/광고/캠페인/매체/트래커)의 어드민 화면입니다. React 19 + Vite 기반 SPA이며 개발 서버 기본 포트는 3000입니다. 데이터는 모노레포의 [backend](../backend/README.md)(:3001) API에서 가져옵니다.

## 기술 스택

- **Framework**: React 19 + Vite 8 — TypeScript (strict)
- **Routing**: react-router 7
- **Server State**: @tanstack/react-query 5 — API 조회·캐싱
- **Client State**: MobX 6 (`mobx-react`) — 페이지 타이틀·선택 메뉴 등 전역 UI 상태
- **UI**: antd 6 + styled-components 6, @tanstack/react-table 8 (테이블)
- **HTTP**: axios — 단일 인스턴스 + 토큰 인터셉터
- **Mocking**: MSW 2 — 개발 모드에서 backend 미구현 엔드포인트만 목킹
- **Test**: Vitest 4 + Testing Library (jsdom)

## 프로젝트 구조

기능 기반(feature-first) 구조입니다. 경로 별칭 `@/*` → `src/*` (`vite.config.ts`와 `tsconfig.json` 양쪽에 설정).

```
src/
├── app/                       # 앱 부트스트랩
│   ├── index.tsx              # 진입점 — MSW 워커 기동 후 createRoot 렌더
│   ├── app.tsx                # 라우팅 + Provider(QueryClient·Store·antd ConfigProvider)
│   ├── store.tsx              # MobX Store + Context (pageTitle·selectedMenu·info·eventName)
│   └── global-styles.tsx      # styled-components 전역 스타일·공용 styled 컴포넌트
├── features/                  # 기능별 화면
│   ├── home/                  # 레이아웃(home) + 대시보드(dashboard)
│   ├── login/                 # 로그인
│   ├── signup/                # 회원가입 (이메일 인증 코드 2단계)
│   ├── advertising/           # 광고 목록·광고주 등록 폼
│   │   └── campaigns/         # 광고별 캠페인 목록
│   │       └── events/        # 캠페인 이벤트 설정
│   ├── detail/                # 광고 상세
│   │   ├── change/            # 트래커 URL 예약 변경
│   │   └── daily/             # 일별 리포트
│   │       └── daily-detail/  # view_code·pub_id·sub_id 단위 상세
│   ├── media/                 # 매체 목록
│   ├── tracker/               # 트래커 목록
│   └── developer/             # 개발자 메뉴 (PrivateRoute 보호)
├── shared/                    # 공용 계층
│   ├── api/                   # axios 인스턴스 + api 객체 + 응답 매퍼
│   ├── lib/                   # 순수 헬퍼 (get-cell, get-total)
│   └── ui/                    # 재사용 컴포넌트 (info-card, modals, private-route, select-options)
└── mocks/                     # MSW 핸들러·워커
```

## 실행

의존성 설치는 모노레포 루트에서 합니다.

```bash
# 루트에서
pnpm install
pnpm dev --filter=frontend   # 개발 서버 (:3000)

# apps/frontend에서
pnpm dev                     # 개발 서버 (:3000)
pnpm build                   # 프로덕션 빌드 → dist/
pnpm preview                 # 빌드 결과 미리보기
pnpm lint                    # eslint src/**/*.{ts,tsx}
pnpm check-types             # tsc --noEmit
```

화면에 실제 데이터를 띄우려면 backend(:3001)와 DB·Redis가 함께 떠 있어야 합니다. 로컬 계정은 backend에서 `pnpm seed`로 생성되는 `admin@test.com` / `test1234!`를 쓰면 됩니다.

## 환경 변수

`.env` 파일은 gitignore되므로 `apps/frontend/.env`를 직접 만듭니다. 코드가 참조하는 변수는 하나입니다.

```env
# backend API 주소 — axios baseURL이자 MSW 핸들러의 매칭 기준
VITE_API_URL=http://localhost:3001
```

> 이 값이 없으면 axios `baseURL`이 `undefined`가 되어 실제 API 호출과 MSW 매칭이 모두 어긋납니다. Vite 환경변수는 `VITE_` 프리픽스가 필수이며 코드에서는 `import.meta.env.VITE_*`로 참조합니다.

`pnpm build:staging` / `pnpm build:prod`는 각각 `--mode staging` / `--mode production`으로 빌드하므로, 사용하려면 `.env.staging` / `.env.production`에 같은 키를 배포 대상 API 주소로 채웁니다.

## 라우팅

`app.tsx`에 정의되어 있습니다. `/` 이하는 `Home` 레이아웃의 중첩 라우트이며, 매칭되지 않는 경로는 `/`로 리다이렉트됩니다.

| 경로 | 화면 |
|---|---|
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/` | 대시보드 (광고별 집계) |
| `/:id` | 광고 상세 (캠페인별 집계) |
| `/:id/change` | 트래커 URL 예약 변경 |
| `/:id/daily` | 일별 리포트 |
| `/:id/daily/detail` | 일별 상세 (view_code·pub_id·sub_id 단위) |
| `/advertising` | 광고 목록 |
| `/advertising/:id` | 광고별 캠페인 목록 |
| `/advertising/:id/events/:campaignIdx` | 캠페인 이벤트 설정 |
| `/media` | 매체 목록 |
| `/tracker` | 트래커 목록 |
| `/developer` | 개발자 메뉴 (`PrivateRoute` 보호) |

## 상태 관리

서버 상태와 클라이언트 상태를 분리합니다.

- **서버 데이터**는 react-query가 담당합니다. 조회 함수는 `shared/api/api.tsx`의 `api` 객체에 모아 두고 컴포넌트에서 `useQuery`로 감쌉니다. 전역 기본값은 `refetchOnWindowFocus: false`, `retry: false`입니다.
- **전역 UI 상태**는 MobX `Store`(`app/store.tsx`)가 담당합니다. 페이지 타이틀, 선택된 메뉴, InfoCard에 표시할 정보, 이벤트명을 보관합니다.

## API 연동 / 인증

- `shared/api/axios.tsx`의 `axiosInstance`가 `baseURL: import.meta.env.VITE_API_URL`로 backend에 붙습니다. dev 서버 proxy는 쓰지 않습니다.
- request 인터셉터가 `sessionStorage.accessToken`을 `Bearer` 헤더로 실어 보냅니다.
- 401 응답이면 response 인터셉터가 `sessionStorage.refreshToken`으로 `/auth/refresh`를 호출해 access token을 재발급하고 원 요청을 **1회** 재시도합니다. 재발급까지 실패하면 세션을 비우고 `/login`으로 보냅니다. 이때 refresh 호출은 인터셉터 재진입을 막기 위해 raw axios를 씁니다.
- react-query v5에는 `useQuery`별 `onError`가 없어, 공통 에러 처리는 `app.tsx`의 `QueryCache.onError` 전역 핸들러가 맡습니다. **401·403일 때만** 세션을 비우고 로그인으로 보내며, 네트워크·서버 오류는 세션을 유지합니다.

화면에서 호출하는 backend 엔드포인트는 `/auth/signin`, `/auth/signup`, `/auth/signup/verify`, `/auth/refresh`, `/dashboard`, `/advertising`, `/advertisers`, `/campaigns`, `/config/:campaignId`, `/media`, `/trackers`, `/reservations`입니다.

backend는 응답을 `{ statusCode, data, _meta }`로 감싸고 카운터를 snake_case·숫자로 내려주는 반면 화면 유틸(`getTotal`·`getCell`)은 camelCase·문자열 카운터를 가정합니다. 이 간극은 `shared/api/api.tsx`의 매퍼(`toCounterStrings`, `mapDashboardRow` 등)가 흡수합니다.

## MSW 목 서버

개발 모드에서만 워커가 뜹니다(`app/index.tsx`). `onUnhandledRequest: 'bypass'`이므로 **핸들러에 등록된 경로만 가로채고 나머지는 실제 backend로 통과**합니다. 즉 목을 끄려고 코드를 고칠 필요가 없습니다.

현재 목킹 대상은 backend에 아직 없는 한 경로뿐입니다.

- `PATCH /advertising/:id` (상태 토글 — backend의 광고 상태는 활성 캠페인 여부에서 파생되는 값이라 토글 엔드포인트가 없습니다)

캠페인 목록의 활성 토글은 목이 아니라 실제 `PATCH /campaigns/:id`(`{ "is_active": boolean }`)를 호출합니다.

워커 기동을 `await`한 뒤 렌더하는 이유는, 기다리지 않으면 새로고침 직후 첫 요청이 목에 걸리지 않고 backend로 흘러가 404 → 로그인 이동이 되기 때문입니다. 위 엔드포인트가 backend에 구현되면 핸들러를 지워야 실제 응답이 화면에 반영됩니다. 워커 스크립트(`public/mockServiceWorker.js`)의 위치는 `package.json`의 `msw.workerDirectory`가 지정합니다.

## 테스트

```bash
pnpm test                    # Vitest 1회 실행
pnpm test:watch              # watch 모드
pnpm test:coverage           # 커버리지 (미달 시 exit 1)
```

테스트는 `src/**/*.{test,spec}.{ts,tsx}`로 소스 옆에 둡니다. 설정은 `vite.config.ts`의 `test` 필드에 있으며 `@/*` 별칭을 그대로 공유합니다.

**커버리지는 statements·branches·functions·lines 4지표 모두 90% 임계가 강제**됩니다. 다만 대상(`coverage.include`)은 현재 테스트가 다루는 순수 로직 파일로 한정되어 있습니다 — `shared/lib/get-cell.tsx`, `shared/lib/get-total.tsx`, `shared/api/api.tsx`. antd·react-table·MobX에 의존하는 화면 컴포넌트를 포함하면 임계를 만족할 수 없기 때문입니다. 대상 파일 안에서 테스트하지 않는 함수는 `/* v8 ignore start */` … `/* v8 ignore stop */`로 분모에서 제외합니다.

## 코드 스타일

- 파일·폴더명은 **kebab-case** (컴포넌트 파일도 `advertising-table.tsx`).
- 컴포넌트·타입 export는 **PascalCase**, 변수·함수는 camelCase, 상수는 UPPER_SNAKE.
- 타입에 `I` 접두사를 붙이지 않습니다. 테이블 컬럼 타입처럼 파일마다 shape이 다른 것은 통합하지 말고 파일별로 둡니다.
- 스타일 파일은 `<name>.styles.tsx`(컴포넌트 종속) 또는 `<feature>.styles.tsx`(기능 전역).
- 이 앱에는 Prettier 설정 파일이 없습니다. 루트에서 `pnpm format`을 돌리면 기본값(2칸 스페이스, `printWidth: 80`)으로 전부 재포맷되므로 주의하세요.

## 배포

`VITE_API_URL`을 배포 대상 API 주소로 두고 빌드한 뒤, 정적 결과물(`dist/`)을 S3에 sync하고 CloudFront 캐시를 무효화합니다. S3 + CloudFront(OAC) 구성과 절차는 [infra/terraform/README.md](../../infra/terraform/README.md)에 있습니다.

main 브랜치에 `apps/frontend/**` 변경이 push되면 `.github/workflows/deploy-frontend.yml`이 위 절차를 자동으로 수행합니다. 저장소 Variables에 `ADMIN_API_URL`·`CLOUDFRONT_DISTRIBUTION_ID`(각각 `terraform output admin_api_url` / `cloudfront_distribution_id`)가 있어야 합니다.

```bash
pnpm build          # 또는 build:staging / build:prod
```

## 라이선스

UNLICENSED
