/*
  Warnings:

  - You are about to alter the column `clicked_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `installed_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `evented_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `media_sent_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `postback` MODIFY `clicked_at` DATETIME NULL,
    MODIFY `installed_at` DATETIME NULL,
    MODIFY `evented_at` DATETIME NULL,
    MODIFY `media_sent_at` DATETIME NULL;

-- AddForeignKey
ALTER TABLE `daily_statistic` ADD CONSTRAINT `daily_statistic_token_fkey` FOREIGN KEY (`token`) REFERENCES `campaign`(`token`) ON DELETE RESTRICT ON UPDATE CASCADE;
