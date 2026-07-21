# shared

여러 기능이 공유하는 코드. 특정 기능에 종속되지 않는 것만 둔다. 하위는 `api`/`lib`/`ui`.

## api

- `axios.tsx` — `axiosInstance`(단일 인스턴스). `baseURL`은 `import.meta.env.VITE_API_URL`. request 인터셉터가 `sessionStorage.accessToken`을 `Bearer`로 실는다.
- `api.tsx` — 화면들이 쓰는 조회 함수 모음(`api` 객체). `getDashboardData`·`getDetail`·`getDaily`·`getCampaigns` 등. CVR 계산 같은 파생 로직도 여기(`getDataWithCvr`). 새 API 호출은 컴포넌트가 아니라 여기에 함수로 추가하고 컴포넌트는 `useQuery`로 감싼다.

## lib

순수 렌더 헬퍼(React 컴포넌트 아님, 테이블 셀·합계 계산에 쓰임).
- `get-cell.tsx` — `getCell` 객체. 테이블 셀 렌더(숫자 천단위 콤마, install/event 링크 셀 등). `useStore`를 참조한다.
- `get-total.tsx` — `getTotal`. 컬럼 합계 계산(`useMemo` 기반).

## ui

기능 간 공유 컴포넌트.
- `private-route.tsx` — 권한 가드 라우트 래퍼(developer 화면에 사용).
- `select-options.tsx` — antd Select 옵션 렌더 헬퍼.
- `info-card/` — 상세 화면 상단의 정보 카드(`InfoCard`). 광고주·트래커·매체 정보 표시와 이미지 업로드.
- `modals/` — 팝업 3종(`event`/`install`/`unregistered`). 각각 `*-modal.tsx`(다이얼로그) + `*-table.tsx`(내부 목록 테이블) 쌍이다.

## 규칙

- `shared`는 `features`를 import하지 않는다(의존 방향은 features → shared). 예외적으로 `info-card`가 일부 feature의 컬럼 타입을 가져다 쓰는데, 이는 타입만 참조하는 것이다.
- 특정 기능에서만 쓰는 컴포넌트·헬퍼는 여기 두지 말고 그 기능 폴더에 둔다.
