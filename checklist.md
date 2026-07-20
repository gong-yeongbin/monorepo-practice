# 인증 제거 체크리스트

구글 인증 전환 작업(미커밋)을 폐기하고, 인증 자체를 제거한다. 모든 엔드포인트는 인증 없이 열린다.

## auth 모듈 제거

- [x] `src/modules/auth/` 전체 삭제 (google·jwt strategy, guard, login·validate-google-user use-case, auth.controller 포함)
- [x] orphan use-case 삭제 — `find-user.use-case.ts`, `get-profile.use-case.ts` (+spec, auth에서만 사용)
- [x] 도메인 컨트롤러 9개에서 `@UseGuards(JwtAuthGuard)` + import 제거 (advertiser·advertising·campaign·config·dashboard·media·partner·tracker·user)
- [x] 도메인 모듈 8개에서 `imports: [AuthModule]` 제거 + `app.module.ts`에서 AuthModule 제거
- [x] `@auth/*` 별칭 제거 — `tsconfig.json` paths, `package.json` jest moduleNameMapper

## user 모듈 정리

- [x] POST /user 복원 — `create-user.dto.ts` `{ email }`, 컨트롤러 `create` 메서드
- [x] `create-user.use-case.ts` — email 중복 검사(ConflictException) 추가, 주석 갱신
- [x] `user.module.ts` — exports 제거 (auth 전용이었음)
- [x] `user.repository.ts` — 주석 갱신 (구글 가입 문구 제거)
- [x] spec 갱신 — create-user.use-case.spec, user.controller.spec

## 의존성 / 설정 / 문서

- [x] `package.json` — @nestjs/jwt·@nestjs/passport·passport·passport-jwt·passport-google-oauth20(+types) 제거, `pnpm install`
- [x] `turbo.json` globalEnv — JWT_SECRET·GOOGLE_* 제거
- [x] README — .env 예시에서 JWT_SECRET·GOOGLE_* 제거, 구글 로그인 안내 문구 제거

## 유지하는 것

- user 스키마(email·approved·role·created_at·updated_at)와 마이그레이션 3개 (090000·100000·110000)
- DEVELOPER role (사용자 결정)
- 가입·수정 시각 컬럼 (직전 작업)

## 검증

- [x] `pnpm test` — prisma client 재생성 전이라 prisma-user.repository.spec 타입 에러 1건은 기존 이슈로 허용
- [ ] (사용자) `pnpm generate` / `pnpm deploy` 후 전체 통과 확인
