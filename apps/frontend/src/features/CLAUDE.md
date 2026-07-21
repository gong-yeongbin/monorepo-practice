# features

기능별 화면 계층. 각 폴더가 하나의 기능(라우트)에 대응한다. `home`/`login`/`advertising`/`detail`/`media`/`trackers`/`developer`.

## 기능 폴더 구성 패턴

한 기능은 보통 이렇게 이뤄진다.
- `<기능>.tsx` — 화면 컴포넌트. 라우트 진입점. `api`를 `useQuery`로 감싸 데이터를 가져오고, 하위 테이블·폼에 넘긴다.
- `<name>-table.tsx` — `@tanstack/react-table` 기반 목록 테이블. 테이블별 컬럼 타입(`AdvertiserColumns` 등)을 이 파일에 정의한다(파일마다 shape이 다르므로 통합하지 않음).
- `<name>-form.tsx` / `*-form.tsx` — 생성·수정 폼.
- `<name>.styles.tsx` / `<기능>.styles.tsx` — styled-components 스타일.

중첩 라우트는 하위 폴더로 표현한다 — `advertising/campaigns/events`, `detail/change`, `detail/daily/daily-detail`.

## 특이 구조

- `home/home.tsx`는 일반 화면이 아니라 **레이아웃 셸**이다. 네비게이션·프로필·브레드크럼을 렌더하고 `<Outlet />`으로 자식 라우트(dashboard·detail·advertising 등)를 그린다.
- `detail`은 세 갈래로 나뉜다 — `detail`(기본 상세), `change`(예약 변경), `daily`(일별 통계, 다시 `daily-detail`로).
- `developer`는 `PrivateRoute`로 감싼 관리자 전용 화면이다(`shared/ui/private-route.tsx`).

## 규칙

- 데이터 조회는 컴포넌트에서 직접 axios를 부르지 말고 `shared/api`의 `api` 객체 함수를 `useQuery`로 감싼다.
- 여러 기능이 공유하는 UI(모달·인포카드 등)는 `features`가 아니라 `shared/ui`에 둔다.
- 파일·폴더는 kebab-case, 컴포넌트 export는 PascalCase(루트 `apps/frontend/CLAUDE.md` 네이밍 규칙).
