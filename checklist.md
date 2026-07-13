# 대시보드 모듈 분리 체크리스트

advertising 모듈의 통계 엔드포인트 5개를 `modules/dashboard/`로 분리한다.

## 배선

- [x] `apps/backend/tsconfig.json` paths에 `@dashboard/*` 추가
- [x] `apps/backend/package.json` jest moduleNameMapper에 `^@dashboard/(.*)$` 추가
- [x] `app.module.ts`에 `DashboardModule` 등록

## dashboard 모듈 신규 생성

- [x] `domain/statistics.entity.ts` (advertising에서 이동)
- [x] `domain/dashboard.repository.ts` — `DASHBOARD_REPOSITORY` 토큰 + `DateRange` + 인터페이스(5개 메서드)
- [x] `application/dto/statistics.dto.ts` + spec (이동)
- [x] `application/dto/advertising-id.dto.ts` + spec (dashboard용 복제)
- [x] use-case 5개 + spec 이동: dashboard / daily / detail / daily-detail / daily-detail-all
- [x] `infrastructure/prisma-dashboard.repository.ts` + spec — 통계 메서드 5개 이동
- [x] `presentation/dashboard.controller.ts` + spec — `GET /dashboard`, `/dashboard/daily`, `/dashboard/dailydetail`, `/dashboard/dailydetail/excel`, `/dashboard/detail/:id`
- [x] `dashboard.module.ts` — AuthModule import, DI 바인딩

## advertising 모듈 축소

- [x] `advertising.repository.ts` — 통계 메서드 5개 + `DateRange` + statistics.entity import 제거
- [x] `prisma-advertising.repository.ts` — 통계 메서드·헬퍼 제거, 헤더 주석 갱신
- [x] `prisma-advertising.repository.spec.ts` — 통계 케이스 제거
- [x] `advertising.controller.ts` — 통계 라우트 5개 + 관련 import·주입 제거
- [x] `advertising.controller.spec.ts` — 통계 케이스 제거, 생성자 인자 정리
- [x] `advertising.module.ts` — 통계 use-case provider 5개 제거
- [x] 이동 완료된 원본 파일 삭제: statistics.entity.ts, statistics.dto.ts(+spec), use-case 5개(+spec)

## 검증

- [x] `pnpm test` 전체 통과 — 75 suites / 162 tests
- [x] `pnpm test:cov` — dashboard·advertising 모듈 4지표 100%
- [x] `pnpm build`(nest build) 통과, ESLint 0 errors
