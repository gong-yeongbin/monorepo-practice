-- daily_statistic 테이블을 daily_report로 이름만 변경한다 (데이터 보존). 인덱스/외래키 이름도 Prisma 컨벤션에 맞춰 함께 rename.

-- DropForeignKey
ALTER TABLE `daily_statistic` DROP FOREIGN KEY `daily_statistic_token_fkey`;

-- RenameTable
ALTER TABLE `daily_statistic` RENAME TO `daily_report`;

-- RenameIndex
ALTER TABLE `daily_report` RENAME INDEX `daily_statistic_view_code_created_date_key` TO `daily_report_view_code_created_date_key`;

-- AddForeignKey
ALTER TABLE `daily_report` ADD CONSTRAINT `daily_report_token_fkey` FOREIGN KEY (`token`) REFERENCES `campaign`(`token`) ON DELETE RESTRICT ON UPDATE CASCADE;
