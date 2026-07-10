/*
  Warnings:

  - You are about to alter the column `clicked_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `installed_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `evented_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `media_sent_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `daily_statistic` MODIFY `view_code` VARCHAR(255) NOT NULL,
    MODIFY `pub_id` VARCHAR(100) NULL,
    MODIFY `sub_id` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `postback` MODIFY `pub_id` VARCHAR(100) NULL,
    MODIFY `sub_id` VARCHAR(100) NULL,
    MODIFY `view_code` VARCHAR(255) NOT NULL,
    MODIFY `clicked_at` DATETIME NULL,
    MODIFY `installed_at` DATETIME NULL,
    MODIFY `evented_at` DATETIME NULL,
    MODIFY `media_sent_at` DATETIME NULL;
