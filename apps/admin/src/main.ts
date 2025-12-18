import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get<ConfigService>(ConfigService);

	const port = configService.get<number>('PORT');
	const client = configService.get<string>('CLIENT');

	app.enableCors({
		origin: client,
		credentials: true,
	});
	app.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	await app.listen(port ? port : 3000);
}
bootstrap();
