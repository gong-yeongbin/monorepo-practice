-- pub_id · sub_id를 255 → 500으로 확대. 데이터가 넘쳐서가 아니라 여유를 두기 위한 조치다.
-- 레거시 실측 최대는 postback pub_id 19 · sub_id 160, daily_report pub_id 19 · sub_id 164로
-- 둘 다 255 초과 0건이었다(각 생성기의 전량 리포트). 매체가 유저 단위 식별자를 실어 보내면
-- 늘어나는 값이라 click_id와 같은 폭으로 맞춰 둔다.
--
-- 두 테이블을 함께 바꾼다. 트래킹 파이프라인이 같은 pub_id·sub_id로 postback과 daily_report에
-- 동시에 쓰므로 한쪽만 넓히면 긴 값이 들어왔을 때 좁은 쪽에서 그대로 실패한다.
--
-- varchar 길이 "확대"는 PostgreSQL 9.2+에서 테이블 재작성이 없다(제약이 느슨해지는 방향이라
-- 재검사를 건너뛴다). daily_report 1,032만 행에도 짧은 ACCESS EXCLUSIVE 락만 걸린다.
-- 두 컬럼 모두 인덱스에 들어가지 않아 인덱스 재생성도 없다.

ALTER TABLE "postback" ALTER COLUMN "pub_id" SET DATA TYPE VARCHAR(500);
ALTER TABLE "postback" ALTER COLUMN "sub_id" SET DATA TYPE VARCHAR(500);

ALTER TABLE "daily_report" ALTER COLUMN "pub_id" SET DATA TYPE VARCHAR(500);
ALTER TABLE "daily_report" ALTER COLUMN "sub_id" SET DATA TYPE VARCHAR(500);
