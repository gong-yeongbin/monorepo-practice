# `@repo/eslint-config`

공유 ESLint / Prettier 설정 모음.

- `@repo/eslint-config/base` — 레포 공통 기본 설정
- `@repo/eslint-config/nestjs` — NestJS 앱/패키지용 설정 (type-checked)
- `@repo/eslint-config/react` — React 앱용 설정 (react, react-hooks, jsx-a11y)
- `@repo/eslint-config/prettier` — NestJS 앱 + prisma용 공유 Prettier 설정

frontend에는 Prettier 설정 파일이 없다. 루트 `pnpm format`을 돌리면 frontend가 Prettier 기본값(2칸 스페이스, `printWidth: 80`)으로 재포맷되므로 앱 단위로 실행할 것.
