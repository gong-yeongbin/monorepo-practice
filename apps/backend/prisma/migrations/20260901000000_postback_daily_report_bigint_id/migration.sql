-- postback·daily_report의 PK를 BIGINT로 넓힌다.
-- 레거시 MySQL 데이터 이관(postback 36.5M · daily_report 18.1M) 이후의 증가율을 감안한 선제 조치로,
-- 행이 비어 있을 때 수행해야 비용이 없다. 두 테이블 모두 id를 참조하는 FK가 없어 파급이 없다.
-- 시퀀스도 함께 넓혀야 INT 상한에서 nextval이 막힌다.

ALTER TABLE "postback" ALTER COLUMN "id" SET DATA TYPE BIGINT;
ALTER SEQUENCE "postback_id_seq" AS BIGINT;

ALTER TABLE "daily_report" ALTER COLUMN "id" SET DATA TYPE BIGINT;
ALTER SEQUENCE "daily_report_id_seq" AS BIGINT;
