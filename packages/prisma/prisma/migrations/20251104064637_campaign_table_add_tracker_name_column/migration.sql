/*
  Warnings:

  - Added the required column `tracker_name` to the `campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `campaign` ADD COLUMN `tracker_name` VARCHAR(30) NOT NULL;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_tracker_name_fkey` FOREIGN KEY (`tracker_name`) REFERENCES `tracker`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
