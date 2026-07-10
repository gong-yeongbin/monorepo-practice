# 이관 체크리스트

진행하면서 체크한다. 각 항목은 "verify"까지 통과해야 완료.

## 0. 준비
- [x] admin-backend API 전수 조사
- [x] monorepo 현황 조사(모듈/스키마/인증 유무)
- [x] plan.md / checklist.md / context-notes.md 작성
- [x] **D1(user 스키마) 결정** — 기존 salt 방식 유지, 스키마 변경 없음
- [x] D2(ResponseInterceptor 적용 범위) 결정 — 어드민 API에만
- [ ] 계획 사용자 승인

## 1. 인증 인프라
- [x] user 도메인 4계층 (domain/application/infrastructure/presentation)
- [x] UserRepository 인터페이스 + 심볼 토큰 + Prisma 구현
- [x] bcrypt 비밀번호 처리 — D1 최종(bcrypt 통일, salt 제거, password VarChar60)
- [x] LocalStrategy / JwtStrategy / LocalAuthGuard / JwtAuthGuard
- [x] ResponseInterceptor 대응물 (src/interceptors/, 어드민 API에만)
- [x] JwtModule 설정 (JWT_SECRET env, turbo.json globalEnv 등록)
- [x] POST /login, POST /user, GET /profile
- [x] 테스트: use-case/repository/strategy/guard spec (신규 23개)
- [x] build/lint/test 통과, user·auth·interceptors 커버리지 4지표 100%
- [ ] verify: 로그인→토큰→/profile e2e — **DB 마이그레이션 적용 후 사용자 검증 대기**

## 2. advertiser
- [x] 4계층 + repository
- [x] GET /advertiser, 생성(POST) — 원본 @Put+@Query → REST 표준 POST+body로 정리
- [x] JwtAuthGuard 보호 + ResponseInterceptor 적용
- [x] 테스트(신규 9개) + build/lint 통과, advertiser 커버리지 4지표 100%
- [ ] verify: e2e — DB 있으면 로그인 토큰으로 GET/POST 확인(사용자 검증)

## 3. media
- [x] 4계층 + repository
- [x] GET /media — campaign 개수 포함(admin 원본 loadRelationCountAndMap 대응, Prisma _count)
- [x] JwtAuthGuard + ResponseInterceptor
- [x] 테스트(신규 4개) + build/lint 통과, media 커버리지 4지표 100%
- [ ] verify: e2e (사용자 검증)

## 4. tracker
- [x] 4계층 + repository — DB tracker 테이블 조회(기존 trackers/ 레지스트리와 무관, 조율 불필요)
- [x] GET /tracker — 원본대로 인증·ResponseInterceptor 없음
- [x] 테스트(신규 3개) + build/lint 통과, tracker 커버리지 4지표 100%
- [ ] verify: e2e (사용자 검증)

## 5. campaign
- [x] 4계층 + repository (monorepo 스키마 기준 재해석)
- [x] POST(생성)/DELETE/PATCH(is_active 토글)/GET + GET·PATCH event(campaign_config)
- [x] block 제외, 특수 URL 분기 제외 (사용자 확정, 스키마 변경 0)
- [x] 테스트(신규 46개) + build/lint 통과, campaign 전 계층 4지표 100%
- [ ] verify: e2e (사용자 검증)

## 6. advertising
- [x] 4계층 + repository (CRUD + 통계, 현재 스키마 기준)
- [x] CRUD: POST(생성,image URL)/GET(목록)/GET list/GET :id(info)/GET campaign/:id/PATCH :id(딸린 campaign 비활성화)
- [x] 통계: dashboard/daily/detail/:id/dailydetail/dailydetail/excel (daily_report groupBy·$queryRaw)
- [x] status=campaign is_active 파생(둘 다), S3 이미지 업로드 제외(image URL 직접), 엑셀=필터없는 조회
- [x] 테스트(신규 45개) + build/lint 통과, advertising 전 계층 4지표 100%
- [ ] verify: e2e (사용자 검증)

## 7. partner
- [ ] Prisma 스키마 추가 + 마이그레이션 SQL(사용자가 적용)
- [ ] 4계층 + repository + GET /partner/:idx
- [ ] 테스트 + verify

## 8. reservation
- [ ] Prisma 스키마 추가 + 마이그레이션 SQL(사용자가 적용)
- [ ] 4계층 + repository + PUT/DELETE/GET on·off
- [ ] 테스트 + verify

## 9. postback 조회 API
- [ ] 트래커 9종 분기 install/event/unregistered (+excel)
- [ ] 테스트 + verify

## 마무리
- [ ] 전체 check-types / lint / test 통과
- [ ] 트래킹·포스트백 기존 파이프라인 회귀 없음 확인
