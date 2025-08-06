-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `password` VARCHAR(20) NOT NULL,
    `salt` VARCHAR(50) NOT NULL,
    `role` CHAR(10) NOT NULL,

    UNIQUE INDEX `user_user_id_key`(`user_id`),
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
CREATE TABLE `media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `install_postback_url` TEXT NOT NULL,
    `event_postback_url` TEXT NOT NULL,

    UNIQUE INDEX `media_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `advertiser_name` VARCHAR(30) NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `image` TEXT NULL,

    UNIQUE INDEX `ad_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(50) NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `type` CHAR(10) NOT NULL,
    `tracker_tracking_url` TEXT NOT NULL,
    `tracking_url` TEXT NOT NULL,
    `ad_id` INTEGER NOT NULL,
    `media_id` INTEGER NOT NULL,
    `is_block` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `campaign_token_key`(`token`),
    UNIQUE INDEX `campaign_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign_event_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `tracker_event_name` VARCHAR(30) NOT NULL,
    `admin_label` VARCHAR(30) NOT NULL,
    `media_send_name` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_ad_id_fkey` FOREIGN KEY (`ad_id`) REFERENCES `ad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_event_mapping` ADD CONSTRAINT `campaign_event_mapping_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
