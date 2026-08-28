-- postback에 수신 시각 created_at을 추가한다.
-- clicked_at·installed_at·evented_at은 트래커가 보내온 이벤트 발생 시각이라 이벤트 종류별로 갈리고 전부 nullable이다.
-- 이 서버가 언제 받았는지는 어느 컬럼에도 남지 않았다.

-- AlterTable
ALTER TABLE "postback" ADD COLUMN "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 기존 행은 수신 시각 기록이 없어 이벤트 시각으로 근사한다(installed_at → evented_at → clicked_at 순).
-- 셋 다 없으면 위 DEFAULT로 채워진 현재 시각을 그대로 둔다.
UPDATE "postback"
SET "created_at" = COALESCE("installed_at", "evented_at", "clicked_at")
WHERE COALESCE("installed_at", "evented_at", "clicked_at") IS NOT NULL;
