import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const configService = app.get<ConfigService>(ConfigService);
	const port = configService.get<number>('PORT');

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	);

	// Swagger 문서 — /docs에서 UI, /docs-json에서 OpenAPI 스펙 제공
	const documentConfig = new DocumentBuilder()
		.setTitle('트래킹·포스트백 API')
		.setDescription('광고 관리 플랫폼(광고주/캠페인/매체/트래커)과 트래킹·포스트백 API 문서')
		.setVersion('1.0')
		.build();
	SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, documentConfig));

	// SIGTERM/SIGINT에서 OnApplicationShutdown(Redis Stream 연결 종료 등)이 실행되도록 한다
	app.enableShutdownHooks();

	await app.listen(port ? port : 3000);
}
bootstrap();
