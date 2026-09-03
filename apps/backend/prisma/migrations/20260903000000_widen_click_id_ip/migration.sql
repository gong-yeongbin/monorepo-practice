-- 레거시 데이터 이관 대비 컬럼 폭 확대. 행이 비어 있을 때 수행해야 비용이 없다.
-- 근거는 db_migration 생성기의 전량 리포트(2,055,886행 대상, LEGACY_POSTBACK.md 2단계).
--
-- click_id: 레거시 최대는 384자다(VarChar(100) 초과 14,224행). 트래커가 붙여 보내는 가변 문자열이라
--   현재 최대가 상한이라는 보장이 없어 여유를 두고 500으로 넓힌다. 조회 인덱스 3개
--   (`[token, installed_at]`·`[token, evented_at]`·`[view_code]`) 어디에도 들어가지 않아 인덱스 영향은 없다.
--   절단하면 postback-consumer의 정확일치 매칭이 영구히 실패하므로 넓히는 것 외에 선택지가 없다.
--
-- ip: 레거시 최대는 39자다(VarChar(30) 초과 538행). IPv6 완전표기가 39자이고
--   IPv4-mapped IPv6(`::ffff:255.255.255.255`)까지 담는 관례 폭이 45자다.
--
-- 둘 다 이관 전용 조치가 아니다 — 지금 프로덕션도 IPv6 클라이언트나 긴 click_id를 받으면 저장에 실패한다.

ALTER TABLE "postback" ALTER COLUMN "click_id" SET DATA TYPE VARCHAR(500);
ALTER TABLE "postback" ALTER COLUMN "ip" SET DATA TYPE VARCHAR(45);
