# view_code 디코드 저장 체크리스트 (2026-09-04)

- [x] `common/utils/view-code.util.ts` — `normalizeViewCode` 추가 + spec
- [x] `tracking/application/tracking-consumer.use-case.ts` — 집계 키·저장값 normalize + spec
- [x] 트래커 install·event 매퍼 10개 — `encodeURIComponent` → `normalizeViewCode`
- [x] `trackers/tracker.registry.spec.ts` — 5개 트래커 매퍼가 viewCode를 디코드하는지 검증
- [x] 마이그레이션 `20260904000003_decode_view_code` — 두 테이블의 실행 당일(KST) 행만 `%2F`·`%2B`·`%3D` 복원
- [x] `schema.prisma` 주석 · `common/CLAUDE.md` 갱신
- [x] `prisma/seed.ts` — daily_report·postback 시드 view_code를 같은 원문 형식으로
- [x] 프론트 `api.tsx` 주석 갱신(인코딩 전송은 그대로 필요)
- [x] `pnpm test` (backend) 통과
- [x] `pnpm check-types` 통과
- [ ] `pnpm db:deploy`로 마이그레이션 적용 확인 (사용자 실행 — 에이전트는 훅으로 차단)
