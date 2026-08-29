-- campaign_config의 이벤트명 3개를 VarChar(50)으로 넓힌다.
--
-- 레거시 postback_registered_event의 tracker/media 값이 최대 39자다(VarChar(30) 초과 337건).
-- 예: airbridge.ecommerce.order.completed (35자)
--
-- 자르면 안 된다. postback-consumer.use-case.ts:57이
--   campaign_config.tracker_event_name === postback.event_name
-- 로 정확히 일치를 보기 때문에, 30자로 잘린 값은 실제 이벤트명과 영원히 매칭되지 않고
-- 해당 이벤트가 조용히 미등록으로 집계된다.

ALTER TABLE "campaign_config" ALTER COLUMN "tracker_event_name" SET DATA TYPE VARCHAR(50);
ALTER TABLE "campaign_config" ALTER COLUMN "admin_event_name" SET DATA TYPE VARCHAR(50);
ALTER TABLE "campaign_config" ALTER COLUMN "media_event_name" SET DATA TYPE VARCHAR(50);
