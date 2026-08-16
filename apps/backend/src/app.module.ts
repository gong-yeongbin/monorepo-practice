import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TrackingModule } from '@tracking/tracking.module';
import { PostbackModule } from '@postback/postback.module';
import { PrismaModule } from '@infra/prisma/prisma.module';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';
import { AdvertiserModule } from '@advertiser/advertiser.module';
import { AdvertisingModule } from '@advertising/advertising.module';
import { MediaModule } from '@media/media.module';
import { TrackerModule } from '@tracker/tracker.module';
import { CampaignModule } from '@campaign/campaign.module';
import { ConfigModule as CampaignConfigModule } from '@config/config.module';
import { PartnerModule } from '@partner/partner.module';
import { DashboardModule } from '@dashboard/dashboard.module';
import { ReservationModule } from '@reservation/reservation.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: `${process.cwd()}/.env` }),
		ScheduleModule.forRoot(),
		PrismaModule,
		TrackingModule,
		PostbackModule,
		UserModule,
		AuthModule,
		AdvertiserModule,
		AdvertisingModule,
		MediaModule,
		TrackerModule,
		CampaignModule,
		CampaignConfigModule,
		PartnerModule,
		DashboardModule,
		ReservationModule,
	],
	controllers: [AppController],
})
export class AppModule {}
