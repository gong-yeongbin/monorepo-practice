import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TrackingModule } from './module';
import { CacheModule } from '@src/core/cache/cache.module';
import { PrismaModule } from '@repo/prisma';

@Module({
	imports: [ConfigModule.forRoot({ envFilePath: `${process.cwd()}/.env` }), PrismaModule, CacheModule, TrackingModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
