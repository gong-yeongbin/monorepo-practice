# 인증 제거 — 맥락 메모

## 배경

2026-07-20 구글 계정 인증 전환을 구현 완료(미커밋) 후, 사용자가 방향을 바꿔 **인증 자체를 제거**하기로 결정. "로컬 로그인 복원"이 아니라 "인증 없는 상태"를 선택함. 구글 인증 구현은 커밋된 적이 없어 삭제로 폐기.

## 결정 사항

- **인증 완전 제거** (사용자 선택). auth 모듈·JWT 가드·passport 계열 전부 삭제. 모든 엔드포인트가 인증 없이 열린다.
- **user 스키마는 email 기반 유지**. 구글 전환에서 만든 `email`(unique)·`approved` 컬럼과 마이그레이션 `20260720090000_user_google_auth`를 유지한다. 이유는 두 가지. (1) 해당 마이그레이션이 로컬 DB에 이미 적용됐을 가능성이 있어(append-only 원칙) 손대지 않는 편이 안전. (2) 인증이 없어도 email이 user 식별자로 더 자연스럽다. `approved`는 인증 게이트 용도가 사라져 지금은 단순 데이터 필드다 — 나중에 불필요하면 별도 마이그레이션으로 제거.
- **DEVELOPER role 유지** (사용자 선택). enum 값과 마이그레이션 `20260720100000` 유지.
- **가입·수정 시각 컬럼 유지** (직전 요청). `created_at`/`updated_at` + 마이그레이션 `20260720110000`.
- **POST /user 복원**. 구글 자동 가입이 사라지면 user 생성 경로가 0이 되므로, email만 받는 생성 엔드포인트를 복원. HEAD의 이전 구현을 따라 중복 검사 + ConflictException 패턴 적용.
- **find-user·get-profile use-case 삭제**. auth(구글 검증·프로필 조회)에서만 쓰였음. `findByEmail`은 create-user의 중복 검사가 쓰므로 repository에 유지.

## 백업

폐기한 구글 인증 구현 스냅샷(삭제 직전 작업 트리 전체)은 세션 scratchpad에 보관.
`/private/tmp/claude-501/-Users-gong-yeongbin-IdeaProjects-monorepo-practice/63e94ef5-42c0-4071-a5bf-c6c65da1b488/scratchpad/pre-auth-removal-tracked.patch` (+ `-untracked.tar.gz`). 임시 디렉터리라 오래 보관하려면 옮겨야 함.

## 주의

- prisma/CLAUDE.md 규칙대로 `generate`/`deploy`는 사용자가 직접 실행. 실행 전까지 prisma-user.repository의 타입체크 실패(구 스키마 기준 생성 타입)는 기존 이슈.
- `20260720090000`이 로컬 DB에 실제 적용됐는지는 미확인. 적용 전이면 `pnpm deploy` 한 번으로 3개 마이그레이션이 순서대로 적용된다.
- 이전 작업(구글 인증 전환)의 체크리스트·맥락 메모는 커밋된 적이 없어 git 히스토리에 없다. 필요하면 위 백업 patch 안에 있음.
