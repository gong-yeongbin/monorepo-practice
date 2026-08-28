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
		// 포스트백 엔드포인트용 IP 기준 rate limit(60초 창). ThrottlerGuard는 PostbackController에만 붙는다.
		// 트래킹에는 붙이지 않는다 — 기본 인메모리 저장소가 IP 키를 지우지 않아 메모리가 무한히 늘고,
		// 요청량 제곱으로 CPU를 먹는다(근거는 tracking.controller.ts 주석). 포스트백은 호출자가
		// 트래커 서버 소수라 키 카디널리티가 낮아 같은 문제가 생기지 않는다.
		ThrottlerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				throttlers: [{ name: 'postback', ttl: 60_000, limit: Number(configService.get('THROTTLE_POSTBACK_LIMIT')) || 600 }],
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
