-- 구글 계정 인증 전환: 로컬 자격(user_id/password) 컬럼을 제거하고 email·approved를 추가한다
-- 기존 로컬 계정은 email이 없어 구글 계정과 연결할 수 없으므로 함께 삭제한다
DELETE FROM `user`;

-- DropIndex
DROP INDEX `user_user_id_key` ON `user`;

-- AlterTable
ALTER TABLE `user`
    DROP COLUMN `user_id`,
    DROP COLUMN `password`,
    ADD COLUMN `email` VARCHAR(255) NOT NULL,
    ADD COLUMN `approved` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `user_email_key` ON `user`(`email`);
