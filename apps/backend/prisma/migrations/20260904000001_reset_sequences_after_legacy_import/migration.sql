-- 레거시 MySQL 이관으로 id를 명시해 넣은 뒤 autoincrement 시퀀스를 맞추지 않아,
-- 신규 INSERT가 이미 존재하는 id를 발급받아 "duplicate key value violates unique constraint "advertiser_pkey""(P2002)가 났다.
-- 시퀀스를 각 테이블의 MAX(id)+1로 맞춘다. 빈 테이블이면 다음 값이 1이 되도록 COALESCE(…,0)+1, is_called=false.
-- autoincrement PK를 가진 테이블 전부를 대상으로 해서 다른 테이블에서 같은 증상이 재발하지 않게 한다.
-- 이관 스크립트를 다시 돌리면 이 시퀀스가 또 뒤처지므로, 그 경우 스크립트 끝에서 같은 setval을 실행해야 한다.

SELECT setval(pg_get_serial_sequence('"user"', 'id'), COALESCE((SELECT MAX("id") FROM "user"), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('"advertiser"', 'id'), COALESCE((SELECT MAX("id") FROM "advertiser"), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('"tracker"', 'id'), COALESCE((SELECT MAX("id") FROM "tracker"), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('"advertising"', 'id'), COALESCE((SELECT MAX("id") FROM "advertising"), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('"campaign"', 'id'), COALESCE((SELECT MAX("id") FROM "campaign"), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('"media"', 'id'), COALESCE((SELECT MAX("id") FROM "media"), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('"campaign_config"', 'id'), COALESCE((SELECT MAX("id") FROM "campaign_config"), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('"reservation"', 'id'), COALESCE((SELECT MAX("id") FROM "reservation"), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('"postback"', 'id'), COALESCE((SELECT MAX("id") FROM "postback"), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('"daily_report"', 'id'), COALESCE((SELECT MAX("id") FROM "daily_report"), 0) + 1, false);
