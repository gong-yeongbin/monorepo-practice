import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './module/user/user.module';

@Module({
	imports: [ConfigModule.forRoot({ envFilePath: [`${process.cwd()}/.env.development`, `${process.cwd()}/.env.production`, `${process.cwd()}/.env`] }), UserModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
