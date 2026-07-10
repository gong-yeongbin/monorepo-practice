-- 인증을 bcrypt로 통일한다. bcrypt 해시는 salt를 문자열에 내장하므로 salt 컬럼이 불필요하고,
-- 해시 길이(60자)를 담기 위해 password를 VarChar(60)으로 확장한다.

-- DropColumn
ALTER TABLE `user` DROP COLUMN `salt`;

-- AlterColumn
ALTER TABLE `user` MODIFY `password` VARCHAR(60) NOT NULL;
