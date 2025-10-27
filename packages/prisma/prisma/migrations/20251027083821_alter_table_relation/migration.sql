-- DropForeignKey
ALTER TABLE `campaign_info` DROP FOREIGN KEY `campaign_info_campaign_id_fkey`;

-- DropIndex
DROP INDEX `campaign_info_campaign_id_fkey` ON `campaign_info`;

-- AddForeignKey
ALTER TABLE `campaign_info` ADD CONSTRAINT `campaign_info_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
