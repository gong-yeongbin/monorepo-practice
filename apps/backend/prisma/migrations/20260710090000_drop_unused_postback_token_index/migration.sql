-- postback은 삽입 전용이라 token 조회가 없어 @@index([token])가 미사용이다. 삽입 시 인덱스 유지 비용만 발생하므로 제거한다.

-- DropIndex
DROP INDEX `postback_token_idx` ON `postback`;
