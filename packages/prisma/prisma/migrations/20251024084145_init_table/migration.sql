-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `password` VARCHAR(20) NOT NULL,
    `salt` VARCHAR(50) NOT NULL,
    `role` ENUM('ADMIN', 'ADVERTISER', 'MEDIA') NOT NULL DEFAULT 'ADMIN',

    UNIQUE INDEX `user_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `advertiser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `advertiser_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tracker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `tracking_url` TEXT NOT NULL,
    `install_postback_url` TEXT NOT NULL,
    `event_postback_url` TEXT NOT NULL,

    UNIQUE INDEX `tracker_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `advertising` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `image` TEXT NULL,
    `advertiser_name` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `advertising_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(36) NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `type` ENUM('CPI', 'CPA') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `tracker_name` VARCHAR(30) NOT NULL,
    `advertising_name` VARCHAR(30) NOT NULL,
    `media_name` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `tracker_event_name` VARCHAR(30) NOT NULL DEFAULT 'install',
    `admin_event_name` VARCHAR(30) NOT NULL DEFAULT 'install',
    `media_event_name` VARCHAR(30) NOT NULL DEFAULT 'install',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `install_postback_url` TEXT NOT NULL,
    `event_postback_url` TEXT NOT NULL,

    UNIQUE INDEX `media_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `advertising` ADD CONSTRAINT `advertising_advertiser_name_fkey` FOREIGN KEY (`advertiser_name`) REFERENCES `advertiser`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_tracker_name_fkey` FOREIGN KEY (`tracker_name`) REFERENCES `tracker`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_advertising_name_fkey` FOREIGN KEY (`advertising_name`) REFERENCES `advertising`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_media_name_fkey` FOREIGN KEY (`media_name`) REFERENCES `media`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_info` ADD CONSTRAINT `campaign_info_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
