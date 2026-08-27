-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ADVERTISER', 'MEDIA', 'DEVELOPER');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('CPI', 'CPA');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(60) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "advertiser_id" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertiser" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,

    CONSTRAINT "advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "tracking_url" TEXT NOT NULL,
    "install_postback_url" TEXT NOT NULL,
    "event_postback_url" TEXT NOT NULL,

    CONSTRAINT "tracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "image" TEXT,
    "advertiser_id" INTEGER NOT NULL,
    "tracker_id" INTEGER NOT NULL,

    CONSTRAINT "advertising_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(36) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "type" "Type" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tracker_name" TEXT NOT NULL,
    "tracker_tracking_url" TEXT NOT NULL,
    "advertising_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "install_postback_url" TEXT NOT NULL,
    "event_postback_url" TEXT NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_config" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "send_media" BOOLEAN NOT NULL DEFAULT true,
    "tracker_event_name" VARCHAR(30) NOT NULL DEFAULT 'install',
    "admin_event_name" VARCHAR(30) NOT NULL DEFAULT 'install',
    "media_event_name" VARCHAR(30) NOT NULL DEFAULT 'install',

    CONSTRAINT "campaign_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "tracking_url" TEXT NOT NULL,
    "reserved_at" TIMESTAMP(0) NOT NULL,
    "is_applied" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postback" (
    "id" SERIAL NOT NULL,
    "tracker_name" VARCHAR(30) NOT NULL,
    "event_name" VARCHAR(100) NOT NULL,
    "click_id" VARCHAR(100) NOT NULL,
    "pub_id" VARCHAR(100),
    "sub_id" VARCHAR(100),
    "view_code" VARCHAR(255) NOT NULL,
    "token" VARCHAR(100) NOT NULL,
    "adid" VARCHAR(50),
    "idfa" VARCHAR(50),
    "ip" VARCHAR(30) NOT NULL,
    "country_code" VARCHAR(10),
    "clicked_at" TIMESTAMP(0),
    "installed_at" TIMESTAMP(0),
    "evented_at" TIMESTAMP(0),
    "media_sent_at" TIMESTAMP(0),
    "revenue_currency" VARCHAR(10),
    "revenue" VARCHAR(50),
    "raw_query_params" TEXT NOT NULL,

    CONSTRAINT "postback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_report" (
    "id" SERIAL NOT NULL,
    "view_code" VARCHAR(255) NOT NULL,
    "token" VARCHAR(100) NOT NULL,
    "pub_id" VARCHAR(100),
    "sub_id" VARCHAR(100),
    "click" INTEGER NOT NULL DEFAULT 0,
    "install" INTEGER NOT NULL DEFAULT 0,
    "registration" INTEGER NOT NULL DEFAULT 0,
    "retention" INTEGER NOT NULL DEFAULT 0,
    "purchase" INTEGER NOT NULL DEFAULT 0,
    "revenue" INTEGER NOT NULL DEFAULT 0,
    "etc1" INTEGER NOT NULL DEFAULT 0,
    "etc2" INTEGER NOT NULL DEFAULT 0,
    "etc3" INTEGER NOT NULL DEFAULT 0,
    "etc4" INTEGER NOT NULL DEFAULT 0,
    "etc5" INTEGER NOT NULL DEFAULT 0,
    "unregistered" INTEGER NOT NULL DEFAULT 0,
    "created_date" DATE NOT NULL,

    CONSTRAINT "daily_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_advertiser_id_key" ON "user"("advertiser_id");

-- CreateIndex
CREATE UNIQUE INDEX "advertiser_name_key" ON "advertiser"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tracker_name_key" ON "tracker"("name");

-- CreateIndex
CREATE UNIQUE INDEX "advertising_name_key" ON "advertising"("name");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_token_key" ON "campaign"("token");

-- CreateIndex
CREATE UNIQUE INDEX "media_name_key" ON "media"("name");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_config_campaign_id_admin_event_name_key" ON "campaign_config"("campaign_id", "admin_event_name");

-- CreateIndex
CREATE INDEX "postback_token_installed_at_idx" ON "postback"("token", "installed_at");

-- CreateIndex
CREATE INDEX "postback_token_evented_at_idx" ON "postback"("token", "evented_at");

-- CreateIndex
CREATE INDEX "postback_view_code_idx" ON "postback"("view_code");

-- CreateIndex
CREATE UNIQUE INDEX "daily_report_view_code_created_date_key" ON "daily_report"("view_code", "created_date");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_advertiser_id_fkey" FOREIGN KEY ("advertiser_id") REFERENCES "advertiser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising" ADD CONSTRAINT "advertising_advertiser_id_fkey" FOREIGN KEY ("advertiser_id") REFERENCES "advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising" ADD CONSTRAINT "advertising_tracker_id_fkey" FOREIGN KEY ("tracker_id") REFERENCES "tracker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_advertising_id_fkey" FOREIGN KEY ("advertising_id") REFERENCES "advertising"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_config" ADD CONSTRAINT "campaign_config_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_token_fkey" FOREIGN KEY ("token") REFERENCES "campaign"("token") ON DELETE RESTRICT ON UPDATE CASCADE;
