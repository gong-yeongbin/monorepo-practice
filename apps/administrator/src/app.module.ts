import { Module } from '@nestjs/common';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@repo/prisma';
import { AuthModule } from '@module/auth/auth.module';
import { UserModule } from '@module/user/user.module';
import { TrackerModule } from '@module/tracker/tracker.module';
import { MediaModule } from '@module/media/media.module';
import { AdvertisingModule } from '@module/advertising/advertising.module';
import { AdvertiserModule } from '@module/advertiser/advertiser.module';
import { CampaignModule } from '@module/campaign/campaign.module';
import { DashboardModule } from '@dashboard/dashboard.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: `${process.cwd()}/.env` }),
		JwtModule.register({ global: true }),
		PrismaModule,
		AuthModule,
		UserModule,
		TrackerModule,
		MediaModule,
		AdvertisingModule,
		AdvertiserModule,
		CampaignModule,
		DashboardModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
