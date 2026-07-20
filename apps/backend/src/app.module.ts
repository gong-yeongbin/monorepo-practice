import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { TrackingModule } from '@tracking/tracking.module';
import { PostbackModule } from '@postback/postback.module';
import { PrismaModule } from '@infra/prisma/prisma.module';
import { UserModule } from '@user/user.module';
import { AdvertiserModule } from '@advertiser/advertiser.module';
import { AdvertisingModule } from '@advertising/advertising.module';
import { MediaModule } from '@media/media.module';
import { TrackerModule } from '@tracker/tracker.module';
import { CampaignModule } from '@campaign/campaign.module';
import { ConfigModule as CampaignConfigModule } from '@config/config.module';
import { PartnerModule } from '@partner/partner.module';
import { DashboardModule } from '@dashboard/dashboard.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: `${process.cwd()}/.env` }),
		PrismaModule,
		TrackingModule,
		PostbackModule,
		UserModule,
		AdvertiserModule,
		AdvertisingModule,
		MediaModule,
		TrackerModule,
		CampaignModule,
		CampaignConfigModule,
		PartnerModule,
		DashboardModule,
	],
	controllers: [AppController],
})
export class AppModule {}
