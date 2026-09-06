-- 어드민 로그 조회(인스톨·이벤트·미등록 모달)의 일자 기준이
-- 트래커 시각(installed_at·evented_at)에서 수신 시각(created_at)으로 바뀌면서
-- 두 인덱스를 [token, created_at] 하나로 대체한다.

-- DropIndex
DROP INDEX "postback_token_installed_at_idx";

-- DropIndex
DROP INDEX "postback_token_evented_at_idx";

-- CreateIndex
CREATE INDEX "postback_token_created_at_idx" ON "postback"("token", "created_at");
