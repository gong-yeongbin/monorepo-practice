# shared

여러 기능이 공유하는 코드. 특정 기능에 종속되지 않는 것만 둔다. 하위는 `api`/`lib`/`ui`.

## api

- `axios.tsx` — `axiosInstance`(단일 인스턴스). `baseURL`은 `import.meta.env.VITE_API_URL`. request 인터셉터가 `sessionStorage.accessToken`을 `Bearer`로 실는다.
- `api.tsx` — 화면들이 쓰는 조회 함수 모음(`api` 객체). `getDashboardData`·`getDetail`·`getDaily`·`getCampaigns`·`getPostback*` 등. CVR 계산 같은 파생 로직(`getDataWithCvr`)과, snake_case·숫자로 오는 응답을 화면 유틸이 기대하는 camelCase·문자열로 바꾸는 매퍼(`toCounterStrings`·`mapDashboardRow` 등)도 여기 있다. 새 API 호출은 컴포넌트가 아니라 여기에 함수로 추가하고 컴포넌트는 `useQuery`로 감싼다.

## lib

순수 헬퍼(대부분 React 컴포넌트가 아니다). 여기 있는 파일이 프론트 테스트·커버리지(90% 임계)의 주 대상이다.
- `get-cell.tsx` — `getCell` 객체. 테이블 셀 렌더(숫자 천단위 콤마, install/event 링크 셀 등). `useStore`를 참조한다.
- `get-total.tsx` — `getTotal`. 컬럼 합계 계산(`useMemo` 기반).
- `auth.ts` — access token payload에서 로그인 사용자(email·role·advertising_ids)를 읽는다. 레이아웃 셸과 `PrivateRoute`가 공유한다. 판정값을 sessionStorage에 따로 저장하지 않는다(부모 effect보다 자식이 먼저 도는 순서 문제).
- `postback-workbook.ts` — 포스트백 로그 엑셀(`write-excel-file`) 시트 조립.

## ui

기능 간 공유 컴포넌트.
- `private-route.tsx` — 역할 가드. `allow` 역할이 아니면 `/`로 되돌린다. `children`이 없으면 중첩 라우트 그룹의 레이아웃(`<Outlet />`)으로 동작해 `app.tsx`가 운영 화면 묶음을 통째로 감싼다.
- `select-options.tsx` — antd Select 옵션 렌더 헬퍼.
- `info-card/` — 상세 화면 상단의 정보 카드(`InfoCard`). 광고주·트래커·매체 정보 표시와 이미지 업로드.
- `modals/` — 팝업 3종(`event`/`install`/`unregistered`). 각각 `*-modal.tsx`(다이얼로그) + `*-table.tsx`(내부 목록 테이블) 쌍이고, 목록 높이는 `use-fill-height.ts`가 계산한다. antd Table에 고정 높이를 두 군데(모달 body·`scroll.y`) 주지 말 것 — `scroll.y` 한 곳만 정한다.

## 규칙

- `shared`는 `features`를 import하지 않는다(의존 방향은 features → shared). 예외적으로 `info-card`가 일부 feature의 컬럼 타입을 가져다 쓰는데, 이는 타입만 참조하는 것이다.
- 특정 기능에서만 쓰는 컴포넌트·헬퍼는 여기 두지 말고 그 기능 폴더에 둔다.
