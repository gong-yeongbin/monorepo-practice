/*
  Warnings:

  - Added the required column `tracker_name` to the `advertising` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `advertising` ADD COLUMN `tracker_name` VARCHAR(30) NOT NULL;

-- AddForeignKey
ALTER TABLE `advertising` ADD CONSTRAINT `advertising_tracker_name_fkey` FOREIGN KEY (`tracker_name`) REFERENCES `tracker`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
