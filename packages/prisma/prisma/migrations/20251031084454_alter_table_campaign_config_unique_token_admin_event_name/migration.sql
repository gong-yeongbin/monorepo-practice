/*
  Warnings:

  - A unique constraint covering the columns `[token,admin_event_name]` on the table `campaign_config` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `campaign_config_token_admin_event_name_key` ON `campaign_config`(`token`, `admin_event_name`);
