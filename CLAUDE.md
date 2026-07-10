# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

pnpm@9 + Turborepo 모노레포. 광고 관리 플랫폼(광고주/캠페인/매체/트래커)과 Kafka 기반 트래킹·포스트백 시스템.

## 명령어

루트에서 turbo로 실행:
- `pnpm dev` — 전체 앱 watch 모드 (`--filter=admin|backend|admin-page`로 특정 앱만)
- `pnpm build` / `pnpm lint` / `pnpm check-types`
- `pnpm docker:up` / `pnpm docker:down` — MySQL + Valkey(Redis) + Kafka 컨테이너

Prisma는 `apps/backend`에서 실행: `pnpm migrate`(--create-only), `pnpm deploy`, `pnpm generate`, `pnpm reset`.

NestJS 앱(admin, backend) 테스트는 Jest: `pnpm test`, `pnpm test:e2e`(`./test/jest-e2e.json`). 단일 테스트는 `pnpm test -- -t "테스트명"`.

## 구조

- `apps/admin` — NestJS 11 + GraphQL(Apollo), 포트 3000, `/graphql`. Passport local + JWT + 쿠키 인증.
- `apps/backend` — NestJS 11 트래킹·포스트백 마이크로서비스, 포트 3001. KafkaJS + cache-manager/Redis. Prisma(MySQL)도 여기서 관리: 스키마 `apps/backend/prisma/schema.prisma`, `PrismaModule`/`PrismaService`는 `src/infra/prisma/`.
- `apps/admin-page` — Vue 3.5 + Vite(rolldown-vite) + PrimeVue + Pinia + Apollo Client, dev 5173.
- `packages/typescript-config`, `packages/eslint-config` — 공유 tsconfig / ESLint 설정 (`@repo/*`).

## 코드 스타일 (주의)

Prettier 설정이 앱마다 다르므로 **루트 `pnpm format`을 무분별하게 돌리지 말고 수정하는 앱의 설정을 따를 것**:
- NestJS 앱 (`@repo/eslint-config/prettier`): 탭 들여쓰기, `printWidth: 180`, 세미콜론 있음, single quote.
- admin-page (`.prettierrc.json`): 스페이스, `printWidth: 100`, **세미콜론 없음**, single quote.

TypeScript strict. `admin-page`는 eslint + oxlint 둘 다 사용(`pnpm lint`가 순차 실행).

## 환경 / 기타

- 각 앱에 `.env` 필요(gitignore됨). 설정값은 README.md 참고.
- Docker DB: `mysql:8.0`, DB명 `mecross`. Redis 자리는 실제로 valkey 사용.
- 커밋 메시지는 **한글**로 작성 (기존 히스토리와 일치).
