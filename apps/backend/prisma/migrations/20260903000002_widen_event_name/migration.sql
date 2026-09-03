-- postback.event_name을 100 → 250으로 확대. 데이터가 넘쳐서가 아니라 여유를 두기 위한 조치다.
-- 레거시 실측 최대는 39자로 100 초과 0건이었다(생성기 전량 리포트, 2,055,886행 기준).
-- 트래커가 정하는 이름이라 상한이 우리 손에 없다 — 예: airbridge.ecommerce.order.completed(35자).
--
-- 절단하면 안 되는 컬럼이다. postback-consumer.use-case.ts:57이
--   campaign_config.tracker_event_name === postback.event_name
-- 로 정확일치를 보기 때문에, 잘린 값은 영원히 매칭되지 않고 그 이벤트가 조용히 미등록으로 집계된다
-- (20260901000002와 같은 이유).
--
-- 주의: 짝이 되는 campaign_config의 이벤트명 3개는 VarChar(50)이다. 50자를 넘는 이벤트명은
-- postback에는 저장되지만 campaign_config에 등록할 수 없어 매칭이 성립하지 않는다.
-- 그 폭을 함께 올릴지는 별도 결정 사항으로 남긴다.

ALTER TABLE "postback" ALTER COLUMN "event_name" SET DATA TYPE VARCHAR(250);
