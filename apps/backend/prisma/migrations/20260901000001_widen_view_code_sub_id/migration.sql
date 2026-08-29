-- 레거시 데이터 이관 대비 컬럼 폭 확대. 행이 비어 있을 때 수행해야 비용이 없다.
--
-- pub_id / sub_id: 레거시 최대는 pub_id 19자 · sub_id 164자다(sub_id는 VarChar(100) 초과 4,146행).
--   매체가 유저 단위 식별자를 실어 보내면 더 길어질 수 있어 둘 다 255로 맞춘다.
--
-- view_code: AES(`token:pub_id:sub_id`)를 base64+URL 인코딩한 파생값이라 두 가변 입력에 딸려 길이가 늘어난다.
--   pub_id+sub_id 합계가 125자를 넘으면 VarChar(255)를 초과한다(레거시 postback_daily 856행 해당).
--   pub_id·sub_id를 255로 넓히면 view_code 최대는 818자가 되므로 고정 폭 대신 TEXT로 둔다.
--   btree 인덱스 행 상한(~2704 bytes)에는 여유가 있다.

ALTER TABLE "postback" ALTER COLUMN "view_code" SET DATA TYPE TEXT;
ALTER TABLE "postback" ALTER COLUMN "pub_id" SET DATA TYPE VARCHAR(255);
ALTER TABLE "postback" ALTER COLUMN "sub_id" SET DATA TYPE VARCHAR(255);

ALTER TABLE "daily_report" ALTER COLUMN "view_code" SET DATA TYPE TEXT;
ALTER TABLE "daily_report" ALTER COLUMN "pub_id" SET DATA TYPE VARCHAR(255);
ALTER TABLE "daily_report" ALTER COLUMN "sub_id" SET DATA TYPE VARCHAR(255);
