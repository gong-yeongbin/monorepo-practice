# 대시보드 모듈 분리 — 맥락 메모

## 배경

advertising 모듈에 있던 통계 엔드포인트 5개(dashboard, daily, dailydetail, dailydetail/excel, detail/:id)는 advertising CRUD가 아니라 `daily_report` 집계를 읽는 리포팅 기능이라 별도 모듈로 분리하기로 함 (2026-07-13 사용자 결정).

## 결정 사항

- **URL prefix는 `/dashboard/*`로 변경** (사용자 선택). 기존 `/advertising/dashboard` → `GET /dashboard` 등. 원본 admin 프론트는 이미 제거되어 활성 클라이언트가 없으므로 breaking change 비용이 낮다고 판단. `/advertising` prefix를 두 모듈이 공유하면 `/advertising/:id`와의 라우트 매칭 순서가 모듈 등록 순서에 의존하게 되는 문제도 회피.
- **detail/:id 포함 5개 전부 이동** (사용자 선택). `daily_report` 집계 쿼리를 한 repository에 모으기 위함.
- **라우트 매핑**: `/advertising/dashboard`→`/dashboard`, `/advertising/daily`→`/dashboard/daily`, `/advertising/dailydetail`→`/dashboard/dailydetail`, `/advertising/dailydetail/excel`→`/dashboard/dailydetail/excel`, `/advertising/detail/:id`→`/dashboard/detail/:id`.
- **AdvertisingIdDto는 dashboard 모듈에 복제**. advertising 모듈도 `info/:id` 등에서 계속 쓰므로 이동 불가. 7줄짜리 DTO 하나 때문에 dashboard→advertising 모듈 의존을 만드는 것보다 복제가 모듈 경계에 깔끔하다고 판단.
- **repository 분리**: `AdvertisingRepository`에서 통계 메서드 5개를 빼서 `DashboardRepository`(`DASHBOARD_REPOSITORY` 토큰) 신설. `DateRange` 타입은 통계 전용이라 dashboard.repository.ts로 이동.
- 클래스/파일명은 기존 이름 유지(DashboardUseCase 등). import 별칭 `@dashboard/*` 신설.

## 주의

- `statistics.entity.ts`·`statistics.dto.ts`·통계 use-case는 advertising 외부에서 참조하는 곳이 없음을 grep으로 확인함 (2026-07-13).
- e2e jest 설정(`test/jest-e2e.json`)에는 alias 매핑이 없어 수정 불필요.
- modules/CLAUDE.md 규약 적용: 4계층, repository 패턴(심볼 토큰 + useClass), spec 나란히 배치, 커버리지 4지표 90% 이상.
