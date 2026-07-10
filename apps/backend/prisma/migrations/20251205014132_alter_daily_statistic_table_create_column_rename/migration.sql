/*
  Warnings:

  - You are about to drop the column `created_at` on the `daily_statistic` table. All the data in the column will be lost.
  - You are about to alter the column `clicked_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `installed_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `evented_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `media_sent_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[view_code,created_date]` on the table `daily_statistic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_date` to the `daily_statistic` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `daily_statistic_view_code_created_at_key` ON `daily_statistic`;

-- AlterTable
ALTER TABLE `daily_statistic` DROP COLUMN `created_at`,
    ADD COLUMN `created_date` DATE NOT NULL;

-- AlterTable
ALTER TABLE `postback` MODIFY `clicked_at` DATETIME NULL,
    MODIFY `installed_at` DATETIME NULL,
    MODIFY `evented_at` DATETIME NULL,
    MODIFY `media_sent_at` DATETIME NULL;

-- CreateIndex
CREATE UNIQUE INDEX `daily_statistic_view_code_created_date_key` ON `daily_statistic`(`view_code`, `created_date`);
