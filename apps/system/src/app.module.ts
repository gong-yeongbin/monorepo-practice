import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PostbackModule, TrackingModule } from './module';
import { PrismaModule } from '@repo/prisma';
import { CacheModule } from '@core/cache/cache.module';

@Module({
	imports: [ConfigModule.forRoot({ envFilePath: `${process.cwd()}/.env` }), PrismaModule, CacheModule, TrackingModule, PostbackModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
