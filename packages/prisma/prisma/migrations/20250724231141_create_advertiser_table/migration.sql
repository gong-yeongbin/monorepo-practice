/*
  Warnings:

  - You are about to alter the column `name` on the `media` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `name` on the `tracker` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `media` MODIFY `name` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `tracker` MODIFY `name` VARCHAR(50) NOT NULL;

-- CreateTable
CREATE TABLE `advertiser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `advertiser_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
