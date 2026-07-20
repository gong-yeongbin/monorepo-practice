-- 회원가입(email+password) 도입: bcrypt 해시(60자) 컬럼을 추가한다.
-- 이메일 인증은 가입 전에 코드 검증으로 끝나므로(통과해야 user 생성) 별도 인증 상태 컬럼은 두지 않는다.
-- 기존 행은 password가 없어 NOT NULL을 만족할 수 없으므로 선례(20260720090000_user_google_auth)에 따라 삭제한다.
DELETE FROM `user`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `password` VARCHAR(60) NOT NULL;
