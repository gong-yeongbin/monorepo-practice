# app

앱 부트스트랩 계층. 진입점·라우팅·전역 Provider·전역 상태·전역 스타일이 여기 모인다. 기능 로직은 두지 않는다(그건 `features`).

## 파일

- `index.tsx` — 진입점. `createRoot`로 렌더. **개발 모드(`import.meta.env.DEV`)일 때 MSW `worker.start()`를 호출**해 API를 목으로 가로챈다(실제 backend 연동 시 주의, 루트 `apps/frontend/CLAUDE.md` 함정 참고).
- `app.tsx` — 라우팅(`react-router`의 `BrowserRouter`)과 Provider 트리(`QueryClientProvider` → `StoreProvider` → antd `ConfigProvider`). react-query의 공통 인증 에러는 여기 `QueryCache.onError`에서 처리한다(v5는 `useQuery`별 onError가 없다).
- `store.tsx` — MobX `Store`(전역 UI 상태: pageTitle·selectedMenu·info·eventName) + Context. 컴포넌트는 `useStore()`로 접근한다. 서버 데이터는 여기 두지 말고 react-query로.
- `global-styles.tsx` — styled-components 전역 스타일(`GlobalStyles`)과 여러 기능이 공유하는 styled 컴포넌트(`Nav`, `TableStyles`, `DefaultImg` 등). 특정 기능 전용 스타일은 그 기능 폴더의 `.styles.tsx`로.

## 주의

- 새 라우트를 추가하면 `app.tsx`의 `<Routes>`에 등록한다. 중첩 라우트는 부모 화면이 `<Outlet />`을 렌더해야 한다(`features/home/home.tsx`가 셸 역할).
- `Store`에 서버에서 온 목록·상세 데이터를 캐싱하지 말 것. 서버 상태는 react-query가 소유한다.
