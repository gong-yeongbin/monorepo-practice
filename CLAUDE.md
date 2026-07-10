# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

pnpm@9 + Turborepo 모노레포. 광고 관리 플랫폼(광고주/캠페인/매체/트래커)과 Redis Stream 기반 트래킹·포스트백 시스템. 현재 워크스페이스 앱은 `apps/backend` 하나다(과거 `admin`·`admin-page` 앱은 `f2b1851`에서 제거됨).

## 명령어

루트에서 turbo로 실행:
- `pnpm dev` — 전체 앱 watch 모드 (`--filter=backend`로 특정 앱만)
- `pnpm build` / `pnpm lint` / `pnpm check-types`
- `pnpm docker:up` / `pnpm docker:down` — MySQL + Valkey(Redis) 컨테이너 (compose에 Kafka 컨테이너도 남아있으나 코드는 더 이상 사용하지 않음)

Prisma는 `apps/backend`에서 실행: `pnpm migrate`(--create-only), `pnpm deploy`, `pnpm generate`, `pnpm reset`.

backend(NestJS) 테스트는 Jest: `pnpm test`, `pnpm test:e2e`(`./test/jest-e2e.json`). 단일 테스트는 `pnpm test -- -t "테스트명"`.

## 구조

- `apps/backend` — NestJS 11 트래킹·포스트백 마이크로서비스, 포트 3001. ioredis 기반 Redis Stream(비동기 메시징) + Redis 캐시. Prisma(MySQL)도 여기서 관리: 스키마 `apps/backend/prisma/schema.prisma`, `PrismaModule`/`PrismaService`는 `src/infra/prisma/`. `src/` 바로 아래는 `common`/`infra`/`modules`/`trackers`이며 각 폴더에 CLAUDE.md가 있다. `modules/<기능>`은 클린 아키텍처 4계층(`domain`/`application`/`infrastructure`/`presentation`)으로 나뉜다.
- `packages/typescript-config`, `packages/eslint-config` — 공유 tsconfig / ESLint 설정 (`@repo/*`).

## 코드 스타일 (주의)

backend(`@repo/eslint-config/prettier`): 탭 들여쓰기, `printWidth: 180`, 세미콜론 있음, single quote. 루트 `pnpm format`은 무분별하게 돌리지 말고 수정하는 앱의 설정을 따를 것.

TypeScript strict.

## 환경 / 기타

- 각 앱에 `.env` 필요(gitignore됨). 설정값은 README.md 참고.
- Docker DB: `mysql:8.0`, DB명 `mecross`. Redis 자리는 실제로 valkey 사용.
- 커밋 메시지는 **한글**로 작성 (기존 히스토리와 일치).
