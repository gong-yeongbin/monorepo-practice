-- 어드민 로그 조회(인스톨·이벤트·미등록 모달)의 일자 기준이
-- 트래커 시각(installed_at·evented_at)에서 수신 시각(created_at)으로 바뀌면서
-- 두 인덱스를 [token, created_at] 하나로 대체한다.
--
-- CreateIndex를 먼저 둔다. 마이그레이션 파일은 한 트랜잭션으로 실행되는데,
-- DropIndex가 잡는 ACCESS EXCLUSIVE 락은 커밋까지 유지되므로 앞에 두면
-- 인덱스 빌드(수 분) 내내 postback 조회까지 막힌다.
-- CreateIndex의 SHARE 락은 쓰기만 막고 조회는 통과시킨다(쓰기는 Redis Stream에 쌓였다가 처리된다).

-- CreateIndex
CREATE INDEX "postback_token_created_at_idx" ON "postback"("token", "created_at");

-- DropIndex
DROP INDEX "postback_token_installed_at_idx";

-- DropIndex
DROP INDEX "postback_token_evented_at_idx";
