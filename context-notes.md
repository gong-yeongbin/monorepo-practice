# 회원가입 + 이메일 인증(AWS SES) — 맥락 메모

## 배경

2026-07-20 인증 전면 제거 직후, 회원가입을 제대로 만들기로 함. email+password 입력 → 6자리 코드 이메일 인증. 승인된 계획: `~/.claude/plans/binary-spinning-mochi.md`.

## 결정 사항 (사용자 선택)

- **6자리 인증 코드 방식** (링크 클릭 아님).
- **가입하면서 메일 인증** (2026-07-20 정책 확정). 처음엔 "가입 후 별도 인증(email_verified 컬럼)"으로 구현했으나 사용자가 정책 정정 → 코드 검증을 통과해야 user가 생성되는 2단계 흐름으로 재작업. 이후 "가입 요청과 함께 코드 발송" UX로 한 번 더 조정(사용자 선택). 최종 흐름은 ① `POST /user { email, password }` — 중복 409, bcrypt 해시+6자리 코드를 `signup:{email}` 키에 JSON으로 10분 TTL 저장(재요청 시 덮어씀), SES 발송, **user 미생성**(200 응답) → ② `POST /user/verify { email, code }` — 중복 409, 만료·불일치 400, 통과 시 대기 정보의 해시로 user 생성(201) 후 대기 삭제. `email_verified` 컬럼은 불필요(생성된 user는 전부 인증 완료 상태). password 해시가 인증 완료까지 Redis에 임시로 머무는 트레이드오프는 인지하고 수용(평문 아님, TTL 자동 소멸).
- **AWS SES 발송** (`@aws-sdk/client-ses`). sandbox 제약: 발신자·수신자 identity 사전 검증 필요, IAM 키는 `.env`.
- **범위는 가입+인증까지.** 로그인(JWT)·가드 재적용은 다음 단계.

## 설계 결정

- 인증 코드는 기존 `CACHE_PORT`(Redis) 재사용 — 키 `email-verification:{email}`, TTL 10분(밀리초 단위 주의). 재사용 방지를 위해 `CachePort`에 `del` 추가.
- **password는 domain `User` 타입에 넣지 않는다.** repository가 Prisma row를 그대로 반환하는 구조라 타입에 넣으면 GET/PATCH 응답에 해시가 노출됨. 대신 `prisma-user.repository.ts`의 findAll/findById/findByEmail/update 4곳에 Prisma `omit: { password: true }` 적용(update도 row를 반환하므로 포함). omit된 row는 User와 일치해 "row 재포장 금지" 규칙과 충돌 없음. 이후 로그인 구현 시 password를 읽는 전용 메서드(findByEmailWithPassword 류)가 필요함.
- 만료·불일치 코드는 같은 400으로 응답(코드 존재 여부 oracle 차단). 이미 가입된 email은 발송·가입 양쪽에서 409.
- bcrypt salt rounds 10, password VarChar(60) — 과거 로컬 인증 시절 선례와 동일. DTO는 MinLength(8)·MaxLength(72)(bcrypt 72바이트 한계).
- 마이그레이션은 기존 user 행 DELETE 후 password NOT NULL 추가(20260720090000 선례). 로컬 개발 DB 전용이라 허용. `20260720130000_add_user_password`는 미적용·미커밋 상태에서 정책 변경을 반영해 수정함(Docker 데몬이 꺼져 있어 deploy가 불가능했음을 확인).
- turbo.json globalEnv는 건드리지 않음 — 런타임 전용 변수 미등재가 현행 컨벤션.

## 알려진 한계 (의도적 제외)

- 코드 발송의 rate limit 없음 — `POST /user/verification-code`를 반복 호출하면 SES 발송이 그만큼 나감(실습 수준에서 허용). 재발송은 같은 엔드포인트 재호출로 해결됨.

## 주의

- `pnpm deploy`/`pnpm generate`는 사용자가 직접 실행(prisma/CLAUDE.md 규칙). generate 전까지 password/email_verified 관련 타입 에러는 정상.
- 직전 작업(인증 제거)의 백업: scratchpad의 `pre-auth-removal-tracked.patch`(+untracked.tar.gz). 세션 임시 디렉터리라 필요하면 옮길 것.

## auth 모듈 분리 (2026-07-21)

- signup 두 엔드포인트를 별도 모듈로 분리하기로 함(사용자 결정). 근거는 세 가지. CacheModule·MailModule이 signup 전용이라 user 모듈의 의존이 비대칭했음. signup은 상태를 가진 플로우고 나머지는 리소스 CRUD라 관심사가 다름. `POST /user`가 user를 생성하지 않아 200으로 우회하던 라우팅 어색함 해소.
- 모듈명은 auth vs signup 논의 끝에 **auth**(사용자 선택). 현재 내용은 registration뿐이지만 이후 login·token이 이 모듈에 들어오는 것을 전제로 한 이름.
- 라우트 변경: `POST /auth/signup`(200 유지, user 미생성) / `POST /auth/signup/verify`(201, user 생성). 클라이언트 입장에서 breaking change.
- auth에는 domain·infrastructure 계층을 만들지 않음 — signup의 산출물이 user 생성이라 user domain의 `USER_REPOSITORY`를 재사용한다(UserModule이 export → AuthModule이 import). 내용 없는 빈 계층 폴더는 만들지 않기로 함(4계층 규칙의 예외, 단순함 우선).
- `pending-signup.constants`·signup DTO 2개도 auth로 이동 — signup 전용이라 user에 남길 이유 없음.
