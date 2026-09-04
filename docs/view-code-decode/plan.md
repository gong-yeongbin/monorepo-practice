# view_code 저장 형식을 URL 디코드된 원문으로 통일 (2026-09-04)

## 목적

`postback.view_code`·`daily_report.view_code`에 `%2F`·`%2B`·`%3D`가 섞인 percent-encoded 문자열이 저장되고 있다.
`encodeURIComponent`는 트래커 URL에 안전하게 싣기 위한 것이므로 URL에만 쓰고, DB에는 디코드된 base64 원문을 저장한다.

## 범위

- 트래킹 consumer가 `daily_report`에 넣기 전에 `decodeURIComponent`.
- 트래커 install·event 매퍼 10개가 viewCode를 `encodeURIComponent`하던 것을 `decodeURIComponent`로 교체.
- 실행 당일(KST) 행만 같은 형식으로 되돌리는 마이그레이션(지난 날짜는 두 테이블이 같은 인코딩 형태라 그대로 둔다).
- `viewCodeCodec.encode`와 트래킹 URL 조립은 **변경하지 않는다.**

## 단계

1. `view-code.util.ts`에 `normalizeViewCode` 추가 → verify: spec (인코딩값·원문·잘못된 % 각각).
2. `tracking-consumer.use-case.ts` 저장 키를 normalize → verify: spec (인코딩·원문 메시지가 한 행으로 합산).
3. 매퍼 10개 교체 → verify: `tracker.registry.spec.ts`로 5개 트래커 install·event 확인.
4. 마이그레이션 `20260904000003_decode_view_code` → verify: `db:deploy` 성공.
5. `pnpm test` · `pnpm check-types` 통과.
