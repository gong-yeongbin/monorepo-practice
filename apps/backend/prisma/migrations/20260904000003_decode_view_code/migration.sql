-- view_code 저장 형식을 URL 디코드된 base64 원문으로 통일한다.
-- 지금까지는 트래커 URL용 encodeURIComponent 결과(`%2F`·`%2B`·`%3D` 포함)가 그대로 저장됐다.
-- base64 문자 중 encodeURIComponent가 바꾸는 것은 `/`·`+`·`=` 세 개뿐이라 이 셋만 되돌리면 정확히 복원된다.
--
-- 실행 당일(KST) 행만 바꾼다. 지난 날짜는 두 테이블 모두 인코딩 형태라 서로 맞고, 배포 후 들어오는 포스트백은
-- 당일 daily_report 행에만 집계되므로 당일 행만 새 형식과 맞추면 된다.
-- 새 코드가 원문 형태의 행을 쓰기 전에 실행해야 daily_report (view_code, created_date) unique와 충돌하지 않는다(배포 순서상 마이그레이션이 먼저).
-- 컬럼은 UTC 기준(timestamp without time zone)이라 KST 자정을 UTC로 변환해 비교한다.

UPDATE "daily_report"
SET "view_code" = regexp_replace(regexp_replace(regexp_replace("view_code", '%2F', '/', 'gi'), '%2B', '+', 'gi'), '%3D', '=', 'gi')
WHERE "view_code" LIKE '%\%%'
  AND "created_date" = (now() AT TIME ZONE 'Asia/Seoul')::date;

UPDATE "postback"
SET "view_code" = regexp_replace(regexp_replace(regexp_replace("view_code", '%2F', '/', 'gi'), '%2B', '+', 'gi'), '%3D', '=', 'gi')
WHERE "view_code" LIKE '%\%%'
  AND "created_at" >= (date_trunc('day', now() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'UTC';
