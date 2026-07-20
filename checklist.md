# 회원가입 + 이메일 인증(AWS SES) 체크리스트

가입하면서 메일 인증하는 2단계 정책(사용자 결정). ① `POST /user`에 email·password 제출 → 해시·코드를 가입 대기로 Redis에 저장하고 코드 발송(user 미생성) → ② `POST /user/verify`에 email·code 제출, 검증 통과 시에만 대기 정보의 해시로 user 생성. 로그인(JWT)은 범위 제외.

## 의존성 / 스키마

- [x] `bcrypt`·`@aws-sdk/client-ses`(+`@types/bcrypt`) 추가, `pnpm install`
- [x] `schema.prisma` user에 `password VarChar(60)` 추가 (email_verified는 정책 변경으로 불필요 — 생성된 user는 전부 인증 완료 상태)
- [x] 마이그레이션 SQL 수기 작성 `20260720130000_add_user_password` (기존 행 DELETE 선례 따름)
- [ ] (사용자) `pnpm deploy` / `pnpm generate` 실행

## infra

- [x] `src/infra/mail/` 신규 4파일 — mail.port(MAIL_PORT), mail.constants(SES_CLIENT), ses-mail.adapter, mail.module
- [x] `cache.port.ts`·`redis-cache.adapter.ts`에 `del(key)` 추가

## user 모듈

- [x] `user.entity.ts` — password는 도메인 타입에 넣지 않음(응답 노출 방지)
- [x] `user.repository.ts` — CreateUserProps에 `password`
- [x] `prisma-user.repository.ts` — findAll/findById/findByEmail/update에 `omit: { password: true }`
- [x] `pending-signup.constants.ts` 신규 — TTL 10분(ms)·키 팩토리·PendingSignup 타입
- [x] `request-signup.use-case.ts` 신규 — 가입된 email 409, 해시·코드를 JSON으로 Redis 저장(재요청 시 덮어씀)·SES 발송
- [x] `verify-signup.use-case.ts` 신규 — 중복 409 → 코드 검증(만료·불일치 400) → 대기 해시로 생성 → 대기 삭제
- [x] `request-signup.dto.ts`(email·password), `verify-signup.dto.ts`(email·code) 신규
- [x] `user.controller.ts` — `POST /user`(신청, 200) + `POST /user/verify`(확정, 201)
- [x] `user.module.ts` — CacheModule·MailModule import, RequestSignup·VerifySignup 등록

## 테스트 / 문서

- [x] request-signup.use-case.spec (3케이스), verify-signup.use-case.spec (4케이스)
- [x] user.controller.spec·prisma-user.repository.spec 갱신
- [x] README `.env` 예시에 AWS_REGION·AWS_ACCESS_KEY_ID·AWS_SECRET_ACCESS_KEY·SES_FROM_EMAIL
- [ ] `pnpm test` / `pnpm test:cov` (modules 4지표 90%+) — generate 이후 전체 통과 확인
