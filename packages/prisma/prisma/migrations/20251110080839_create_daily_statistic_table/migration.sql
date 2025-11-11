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

-- CreateTable
CREATE TABLE `daily_statistic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `view_code` VARCHAR(100) NOT NULL,
    `token` VARCHAR(100) NOT NULL,
    `pub_id` VARCHAR(50) NULL,
    `sub_id` VARCHAR(50) NULL,
    `click` INTEGER NOT NULL DEFAULT 0,
    `install` INTEGER NOT NULL DEFAULT 0,
    `registration` INTEGER NOT NULL DEFAULT 0,
    `retention` INTEGER NOT NULL DEFAULT 0,
    `purchase` INTEGER NOT NULL DEFAULT 0,
    `revenue` INTEGER NOT NULL DEFAULT 0,
    `etc1` INTEGER NOT NULL DEFAULT 0,
    `etc2` INTEGER NOT NULL DEFAULT 0,
    `etc3` INTEGER NOT NULL DEFAULT 0,
    `etc4` INTEGER NOT NULL DEFAULT 0,
    `etc5` INTEGER NOT NULL DEFAULT 0,
    `unregistered` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
