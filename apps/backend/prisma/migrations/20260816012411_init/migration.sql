-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `role` ENUM('ADMIN', 'ADVERTISER', 'MEDIA', 'DEVELOPER') NOT NULL DEFAULT 'ADMIN',
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `advertiser_id` INTEGER NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_advertiser_id_key`(`advertiser_id`),
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
    `advertiser_id` INTEGER NOT NULL,
    `tracker_id` INTEGER NOT NULL,

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
    `tracker_name` TEXT NOT NULL,
    `tracker_tracking_url` TEXT NOT NULL,
    `advertising_id` INTEGER NOT NULL,
    `media_id` INTEGER NOT NULL,

    UNIQUE INDEX `campaign_token_key`(`token`),
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
CREATE TABLE `campaign_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `send_media` BOOLEAN NOT NULL DEFAULT true,
    `tracker_event_name` VARCHAR(30) NOT NULL DEFAULT 'install',
    `admin_event_name` VARCHAR(30) NOT NULL DEFAULT 'install',
    `media_event_name` VARCHAR(30) NOT NULL DEFAULT 'install',

    UNIQUE INDEX `campaign_config_campaign_id_admin_event_name_key`(`campaign_id`, `admin_event_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `tracking_url` TEXT NOT NULL,
    `reserved_at` DATETIME NOT NULL,
    `is_applied` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tracker_name` VARCHAR(30) NOT NULL,
    `event_name` VARCHAR(100) NOT NULL,
    `click_id` VARCHAR(100) NOT NULL,
    `pub_id` VARCHAR(100) NULL,
    `sub_id` VARCHAR(100) NULL,
    `view_code` VARCHAR(255) NOT NULL,
    `token` VARCHAR(100) NOT NULL,
    `adid` VARCHAR(50) NULL,
    `idfa` VARCHAR(50) NULL,
    `ip` VARCHAR(30) NOT NULL,
    `country_code` VARCHAR(10) NULL,
    `clicked_at` DATETIME NULL,
    `installed_at` DATETIME NULL,
    `evented_at` DATETIME NULL,
    `media_sent_at` DATETIME NULL,
    `revenue_currency` VARCHAR(10) NULL,
    `revenue` VARCHAR(50) NULL,
    `raw_query_params` TEXT NOT NULL,

    INDEX `postback_token_installed_at_idx`(`token`, `installed_at`),
    INDEX `postback_token_evented_at_idx`(`token`, `evented_at`),
    INDEX `postback_view_code_idx`(`view_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `view_code` VARCHAR(255) NOT NULL,
    `token` VARCHAR(100) NOT NULL,
    `pub_id` VARCHAR(100) NULL,
    `sub_id` VARCHAR(100) NULL,
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
    `created_date` DATE NOT NULL,

    UNIQUE INDEX `daily_report_view_code_created_date_key`(`view_code`, `created_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertiser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advertising` ADD CONSTRAINT `advertising_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertiser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advertising` ADD CONSTRAINT `advertising_tracker_id_fkey` FOREIGN KEY (`tracker_id`) REFERENCES `tracker`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_advertising_id_fkey` FOREIGN KEY (`advertising_id`) REFERENCES `advertising`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign` ADD CONSTRAINT `campaign_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_config` ADD CONSTRAINT `campaign_config_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_report` ADD CONSTRAINT `daily_report_token_fkey` FOREIGN KEY (`token`) REFERENCES `campaign`(`token`) ON DELETE RESTRICT ON UPDATE CASCADE;
