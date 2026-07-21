# CLAUDE.md

이 파일은 `apps/frontend`에서 작업할 때의 가이드다. 루트 `CLAUDE.md`도 함께 참고할 것.

광고 관리 플랫폼의 admin 프론트엔드. React 19 + Vite + TypeScript(strict). 상태는 서버 상태와 클라이언트 상태를 분리한다 — 서버 데이터는 **@tanstack/react-query**, 전역 UI 상태(페이지 타이틀·선택 메뉴·InfoCard 정보 등)는 **MobX**(`src/app/store.tsx`).

## 명령어

루트에서 turbo로 실행(`pnpm dev --filter=frontend`) 하거나 이 디렉터리에서 직접 실행한다.
- `pnpm dev` — Vite 개발 서버, **포트 3000**.
- `pnpm build` / `pnpm build:staging` / `pnpm build:prod` — 모드별 빌드.
- `pnpm preview` — 빌드 결과 미리보기.
- `pnpm lint` — `eslint src/**/*.{ts,tsx}`. `pnpm check-types` — `tsc --noEmit`.

테스트 러너는 없다. 변경 후 검증은 `check-types` + `build`로 한다.

## 구조 (기능 기반 + FSD 유사)

- `src/app` — 앱 부트스트랩. `index.tsx`(진입점), `app.tsx`(라우팅·Provider), `store.tsx`(MobX Store + Context), `global-styles.tsx`(styled-components 전역 스타일·공용 styled 컴포넌트).
- `src/features/<기능>` — 기능별 화면. `home`/`login`/`advertising`/`detail`/`media`/`trackers`/`developer`. 중첩 라우트는 하위 폴더로(`advertising/campaigns/events`, `detail/change`, `detail/daily/daily-detail`).
- `src/shared` — 공용. `api`(axios 인스턴스 + `api` 객체), `lib`(get-cell·get-total 등 순수 헬퍼), `ui`(info-card·modals·private-route·select-options 등 재사용 컴포넌트).
- `src/mocks` — MSW 목 서버(`handlers.ts`, `browser.ts`).
- 경로 별칭 `@/*` → `src/*` (vite.config.ts + tsconfig.json 양쪽에 설정).

## 네이밍 컨벤션 (엄수)

- **파일·폴더명은 kebab-case.** 컴포넌트 파일도 `advertising-table.tsx`, 폴더도 `campaigns/`. 대소문자 git 충돌을 막고 일관성을 유지한다.
- **컴포넌트·타입 export는 PascalCase**(`AdvertisingTable`, `AdvertiserColumns`), 변수·함수는 camelCase, 상수는 UPPER_SNAKE.
- 타입에 헝가리안 `I` 접두사를 붙이지 않는다(`IColumns` 아님 → `AdvertiserColumns`처럼 의미 담은 이름). 테이블별 컬럼 타입은 파일마다 shape이 다르므로 통합하지 말고 파일별로 둔다.
- 스타일 파일은 `<name>.styles.tsx`(컴포넌트 종속) 또는 `<feature>.styles.tsx`(기능 전역).

## API 연동 / 인증

- `shared/api/axios.tsx`의 `axiosInstance`가 `baseURL: import.meta.env.VITE_API_URL`로 backend에 붙는다. proxy는 없다.
- 인증은 `sessionStorage.accessToken`을 request 인터셉터가 `Bearer`로 실어 보낸다. react-query의 `QueryCache.onError`가 에러 시 세션을 비우고 `/login`으로 보낸다(`app.tsx`).
- 데이터 조회 함수는 `shared/api/api.tsx`의 `api` 객체에 모아 둔다. 컴포넌트는 이걸 `useQuery`로 감싼다.

## 주의 (함정)

- **개발 모드에서 MSW가 항상 켜진다.** `index.tsx`가 `import.meta.env.DEV`일 때 `worker.start()`를 호출해, `pnpm dev`로 띄우면 API 요청을 **실제 backend가 아니라 `src/mocks/handlers.ts`의 목이 가로챈다.** 로컬 backend에 직접 붙이려면 이 조건을 끄거나 우회해야 한다.
- **`.env`가 없어 `VITE_API_URL`이 undefined다.** dev에선 MSW가 가로채므로 문제가 안 드러나지만, 실제 backend 연동 시 `.env`에 `VITE_API_URL`을 넣어야 axios baseURL과 요청 경로가 맞는다.
- `vite.config.ts` 상단 주석("React 17, 포트 3000")은 낡았다. 실제는 React 19이며 포트 3000만 맞다.
- react-query v5는 `useQuery`별 `onError`가 없다. 공통 에러 처리는 `app.tsx`의 `QueryCache.onError` 전역 핸들러로 한다.
