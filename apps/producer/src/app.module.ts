import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProducerModule } from './module';
import { ValkeyModule } from './core/valkey/valkey.module';
import { PrismaModule } from '@repo/prisma';

@Module({
	imports: [
		ConfigModule.forRoot({ envFilePath: [`${process.cwd()}/.env.development`, `${process.cwd()}/.env.production`, `${process.cwd()}/.env`] }),
		PrismaModule,
		ValkeyModule,
		ProducerModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
