import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { DashboardModule } from '@dashboard/dashboard.module';
import { ReservationModule } from '@reservation/reservation.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: `${process.cwd()}/.env` }),
		ScheduleModule.forRoot(),
		// 공개(무인증) 트래킹·포스트백 엔드포인트용 IP 기준 rate limit(60초 창).
		// 가드는 해당 컨트롤러에만 붙이므로 어드민 API에는 적용되지 않으며, 각 컨트롤러는 자기 이름의 throttler만 쓴다(SkipThrottle로 상호 제외).
		ThrottlerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				throttlers: [
					{ name: 'tracking', ttl: 60_000, limit: Number(configService.get('THROTTLE_TRACKING_LIMIT')) || 300 },
					{ name: 'postback', ttl: 60_000, limit: Number(configService.get('THROTTLE_POSTBACK_LIMIT')) || 600 },
				],
			}),
		}),
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
		DashboardModule,
		ReservationModule,
	],
	controllers: [AppController],
})
export class AppModule {}
