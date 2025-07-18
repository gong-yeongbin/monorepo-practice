import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProducerModule } from './module';
import { ValkeyModule } from './core/valkey/valkey.module';
import { PrismaModule } from './core/prisma/prisma.module';

@Module({
	imports: [ConfigModule.forRoot(), ValkeyModule, PrismaModule, ProducerModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
