import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { TrackingModule } from '@tracking/tracking.module';
import { PostbackModule } from '@postback/postback.module';
import { PrismaModule } from '@infra/prisma/prisma.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: `${process.cwd()}/.env` }), PrismaModule, TrackingModule, PostbackModule],
	controllers: [AppController],
})
export class AppModule {}
