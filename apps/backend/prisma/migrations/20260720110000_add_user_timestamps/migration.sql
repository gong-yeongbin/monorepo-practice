-- user에 가입 시각(created_at)·수정 시각(updated_at)을 추가한다. 기존 행은 마이그레이션 적용 시각으로 채워진다.
-- updated_at의 갱신은 Prisma @updatedAt이 클라이언트 측에서 처리한다.

-- AlterTable
ALTER TABLE `user`
    ADD COLUMN `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
