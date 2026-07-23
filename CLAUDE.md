# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

pnpm@9 + Turborepo 모노레포. 광고 관리 플랫폼(광고주/캠페인/매체/트래커)과 Redis Stream 기반 트래킹·포스트백 시스템. 워크스페이스 앱은 `apps/backend`(NestJS API)와 `apps/frontend`(React 어드민) 둘이다(과거 `admin`·`admin-page` 앱은 `f2b1851`에서 제거됨).

## 명령어

루트에서 turbo로 실행:
- `pnpm dev` — 전체 앱 watch 모드 (`--filter=backend` / `--filter=frontend`로 특정 앱만)
- `pnpm build` / `pnpm lint` / `pnpm check-types` / `pnpm test`
- `pnpm docker:up` / `pnpm docker:down` — MySQL + Redis 컨테이너

Prisma는 `apps/backend`에서 실행: `pnpm migrate`(--create-only), `pnpm deploy`, `pnpm generate`, `pnpm reset`, `pnpm seed`(로컬 테스트 데이터, `reset` 시 자동 실행).

backend(NestJS) 테스트는 Jest: `pnpm test`, `pnpm test:e2e`(`./test/jest-e2e.json`). 단일 테스트는 `pnpm test -- -t "테스트명"`.

frontend 테스트는 Vitest: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`. 커버리지는 4지표 90% 임계가 강제되어 미달 시 실패한다.

## 구조

- `apps/backend` — NestJS 11 어드민 API + 트래킹·포스트백 서비스, 포트 3001. Swagger UI는 `/docs`, 스펙은 `/docs-json`. ioredis 기반 Redis Stream(비동기 메시징) + Redis 캐시. Prisma(MySQL)도 여기서 관리: 스키마 `apps/backend/prisma/schema.prisma`, `PrismaModule`/`PrismaService`는 `src/infra/prisma/`. `src/` 바로 아래는 `common`/`infra`/`interceptors`/`modules`/`trackers`이며 `common`·`infra`·`modules`·`trackers`에 CLAUDE.md가 있다. `modules/<기능>`(auth·user·advertiser·advertising·campaign·config·media·tracker·partner·dashboard·tracking·postback)은 클린 아키텍처 4계층(`domain`/`application`/`infrastructure`/`presentation`)으로 나뉜다. 엔드포인트 호출용 `.http` 파일은 `apps/backend/http/`에 있다.
- `apps/frontend` — React 19 + Vite 어드민, dev 서버 포트 3000. 서버 상태는 @tanstack/react-query, 전역 UI 상태는 MobX(`src/app/store.tsx`). `src/` 아래는 `app`/`features`/`shared`/`mocks`이며 각 폴더에 CLAUDE.md가 있다. 경로 별칭 `@/*` → `src/*`. dev 모드에서는 MSW 목 서버가 항상 켜져 API 요청을 가로챈다.
- `packages/typescript-config`, `packages/eslint-config` — 공유 tsconfig / ESLint 설정 (`@repo/*`). ESLint는 `base`/`nestjs`/`react`/`prettier` export를 제공한다.

## 코드 스타일 (주의)

backend(`@repo/eslint-config/prettier`): 탭 들여쓰기, `printWidth: 180`, 세미콜론 있음, single quote. 루트 `pnpm format`은 무분별하게 돌리지 말고 수정하는 앱의 설정을 따를 것. frontend에는 prettier 설정 파일이 없어 루트 `pnpm format`을 돌리면 기본값(2칸 스페이스, `printWidth: 80`)으로 전부 재포맷되므로 주의할 것.

frontend 네이밍: 파일·폴더명은 kebab-case, 컴포넌트·타입 export는 PascalCase, 타입에 `I` 접두사를 붙이지 않는다.

TypeScript strict.

## 환경 / 기타

- 각 앱에 `.env` 필요(gitignore됨). 설정값은 README.md 참고.
- Docker DB: `mysql:8.0`, DB명 `mecross`. Redis는 `redis:alpine` 사용.
- 커밋 메시지는 **한글**로 작성 (기존 히스토리와 일치).
