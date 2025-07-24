import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { TrackerModule } from './module/tracker/tracker.module';
import { MediaModule } from './module/media/media.module';
import { PrismaModule } from '@repo/prisma';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: [`${process.cwd()}/.env.development`, `${process.cwd()}/.env.production`, `${process.cwd()}/.env`] }),
		JwtModule.register({ global: true }),
		PrismaModule,
		AuthModule,
		UserModule,
		TrackerModule,
		MediaModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
