-- CreateTable
CREATE TABLE `ad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `image` TEXT NULL,
    `advertiser_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ad_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ad` ADD CONSTRAINT `ad_advertiser_name_fkey` FOREIGN KEY (`advertiser_name`) REFERENCES `advertiser`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
