-- user와 advertiser를 1:1로 연결한다. advertiser_id는 nullable(소속 없는 계정)이며 unique로 1:1을 강제한다.

-- AlterTable
ALTER TABLE `user` ADD COLUMN `advertiser_id` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_advertiser_id_key` ON `user`(`advertiser_id`);

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_advertiser_id_fkey` FOREIGN KEY (`advertiser_id`) REFERENCES `advertiser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
