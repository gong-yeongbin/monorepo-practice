/*
  Warnings:

  - You are about to drop the column `advertiser_name` on the `advertising` table. All the data in the column will be lost.
  - You are about to drop the column `tracker_name` on the `advertising` table. All the data in the column will be lost.
  - You are about to drop the column `advertising_name` on the `campaign` table. All the data in the column will be lost.
  - You are about to drop the column `media_name` on the `campaign` table. All the data in the column will be lost.
  - You are about to drop the column `tracker_name` on the `campaign` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `campaign_config` table. All the data in the column will be lost.
  - You are about to alter the column `clicked_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `installed_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `evented_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `media_sent_at` on the `postback` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[campaign_id,admin_event_name]` on the table `campaign_config` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `advertiser_id` to the `advertising` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tracker_id` to the `advertising` table without a default value. This is not possible if the table is not empty.
  - Added the required column `advertising_id` to the `campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `media_id` to the `campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaign_id` to the `campaign_config` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `advertising` DROP FOREIGN KEY `advertising_advertiser_name_fkey`;

-- DropForeignKey
ALTER TABLE `advertising` DROP FOREIGN KEY `advertising_tracker_name_fkey`;

-- DropForeignKey
ALTER TABLE `campaign` DROP FOREIGN KEY `campaign_advertising_name_fkey`;

-- DropForeignKey
ALTER TABLE `campaign` DROP FOREIGN KEY `campaign_media_name_fkey`;

-- DropForeignKey
ALTER TABLE `campaign` DROP FOREIGN KEY `campaign_tracker_name_fkey`;

-- DropForeignKey
ALTER TABLE `campaign_config` DROP FOREIGN KEY `campaign_config_token_fkey`;

-- DropIndex
DROP INDEX `advertising_advertiser_name_fkey` ON `advertising`;

-- DropIndex
DROP INDEX `advertising_tracker_name_fkey` ON `advertising`;

-- DropIndex
DROP INDEX `campaign_advertising_name_fkey` ON `campaign`;

-- DropIndex
DROP INDEX `campaign_media_name_fkey` ON `campaign`;

-- DropIndex
DROP INDEX `campaign_tracker_name_fkey` ON `campaign`;

-- DropIndex
DROP INDEX `campaign_config_token_admin_event_name_key` ON `campaign_config`;

-- AlterTable
ALTER TABLE `advertising` DROP COLUMN `advertiser_name`,
    DROP COLUMN `tracker_name`,
    ADD COLUMN `advertiser_id` INTEGER NOT NULL,
    ADD COLUMN `tracker_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `campaign` DROP COLUMN `advertising_name`,
    DROP COLUMN `media_name`,
    DROP COLUMN `tracker_name`,
    ADD COLUMN `advertising_id` INTEGER NOT NULL,
    ADD COLUMN `media_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `campaign_config` DROP COLUMN `token`,
    ADD COLUMN `campaign_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `postback` MODIFY `clicked_at` DATETIME NULL,
    MODIFY `installed_at` DATETIME NULL,
    MODIFY `evented_at` DATETIME NULL,
    MODIFY `media_sent_at` DATETIME NULL;

-- CreateIndex
CREATE UNIQUE INDEX `campaign_config_campaign_id_admin_event_name_key` ON `campaign_config`(`campaign_id`, `admin_event_name`);

-- AddForeignKey
ALTER TABLE `advertising` ADD CONSTRAINT `advertising_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertiser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advertising` ADD CONSTRAINT `advertising_tracker_id_fkey` FOREIGN KEY (`tracker_id`) REFERENCES `tracker`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_advertising_id_fkey` FOREIGN KEY (`advertising_id`) REFERENCES `advertising`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_config` ADD CONSTRAINT `campaign_config_id_fkey` FOREIGN KEY (`id`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
