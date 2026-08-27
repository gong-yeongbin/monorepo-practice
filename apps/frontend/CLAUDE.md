# CLAUDE.md

이 파일은 `apps/frontend`에서 작업할 때의 가이드다. 루트 `CLAUDE.md`도 함께 참고할 것.

광고 관리 플랫폼의 admin 프론트엔드. React 19 + Vite + TypeScript(strict). 상태는 서버 상태와 클라이언트 상태를 분리한다 — 서버 데이터는 **@tanstack/react-query**, 전역 UI 상태(페이지 타이틀·선택 메뉴·InfoCard 정보 등)는 **MobX**(`src/app/store.tsx`).

## 명령어

루트에서 turbo로 실행(`pnpm dev --filter=frontend`) 하거나 이 디렉터리에서 직접 실행한다.
- `pnpm dev` — Vite 개발 서버, **포트 3000**.
- `pnpm build` / `pnpm build:staging` / `pnpm build:prod` — 모드별 빌드.
- `pnpm preview` — 빌드 결과 미리보기.
- `pnpm lint` — `eslint src/**/*.{ts,tsx}`. `pnpm check-types` — `tsc --noEmit`.
- `pnpm test` — Vitest 1회 실행(jsdom 환경). `pnpm test:watch`로 watch 모드. `pnpm test:coverage`로 커버리지. 테스트 설정은 `vite.config.ts`의 `test` 필드에 있고, `@/*` 별칭을 그대로 공유한다.

테스트는 `src/**/*.{test,spec}.{ts,tsx}`로 콜로케이션한다. 현재는 React 비의존 순수 로직 위주다 — `shared/lib`(get-cell·get-total), `shared/api`(CVR 파생). `getTotal`은 `useMemo`를 쓰므로 `@testing-library/react`로 렌더해 검증한다.

## 커버리지 기준 (엄수)

**커버리지는 90% 이상이어야 한다.** `vite.config.ts`의 `test.coverage.thresholds`가 statements·branches·functions·lines 모두 90%로 강제하며, 미달 시 `pnpm test:coverage`가 exit 1로 **실패**한다.

- 커버리지 대상(`coverage.include`)은 **테스트한 순수 로직 파일로 한정**한다 — `shared/lib/get-cell.tsx`, `shared/lib/get-total.tsx`, `shared/api/api.tsx`. 화면 컴포넌트(antd·react-table·MobX 의존)를 포함하면 90%를 만족할 수 없다.
- 대상 파일 안에서 테스트하지 않는 함수는 `/* v8 ignore start */` … `/* v8 ignore stop */`로 분모에서 제외한다(예: `api.tsx`의 axios 조회 함수, `get-cell.tsx`의 useStore/JSX 링크 셀).
- 순수 로직을 추가하거나 테스트를 넓힐 때는 해당 파일을 `include`에 넣고 90%를 유지한 채 확장한다.

## 구조 (기능 기반 + FSD 유사)

- `src/app` — 앱 부트스트랩. `index.tsx`(진입점), `app.tsx`(라우팅·Provider), `store.tsx`(MobX Store + Context), `global-styles.tsx`(styled-components 전역 스타일·공용 styled 컴포넌트).
- `src/features/<기능>` — 기능별 화면. `home`/`login`/`signup`/`advertising`/`detail`/`media`/`tracker`/`developer`. 중첩 라우트는 하위 폴더로(`advertising/campaigns/events`, `detail/change`, `detail/daily/daily-detail`).
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
- 인증은 `sessionStorage.accessToken`을 request 인터셉터가 `Bearer`로 실어 보낸다. 401이면 response 인터셉터가 `refreshToken`으로 `/auth/refresh`를 호출해 원 요청을 1회 재시도한다(재발급도 실패하면 세션을 비우고 `/login`).
- react-query의 `QueryCache.onError`는 **401·403일 때만** 세션을 비우고 `/login`으로 보낸다(`app.tsx`). 네트워크·서버 오류는 세션을 유지한다.
- 데이터 조회 함수는 `shared/api/api.tsx`의 `api` 객체에 모아 둔다. 컴포넌트는 이걸 `useQuery`로 감싼다.

## 주의 (함정)

- **개발 모드에서 MSW는 backend에 없는 엔드포인트만 목킹한다.** `index.tsx`가 `worker.start({ onUnhandledRequest: 'bypass' })`로 워커를 켜고, 핸들러에 없는 요청은 실제 backend(3001)로 통과한다. 목 대상 목록은 `src/mocks/CLAUDE.md` 참고.
- **`.env`에 `VITE_API_URL=http://localhost:3001`이 필요하다**(gitignore되므로 직접 만든다). 없으면 axios baseURL이 undefined가 되어 실제 backend 호출과 MSW 매칭이 모두 어긋난다.
- react-query v5는 `useQuery`별 `onError`가 없다. 공통 에러 처리는 `app.tsx`의 `QueryCache.onError` 전역 핸들러로 한다.
