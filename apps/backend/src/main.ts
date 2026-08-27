import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// 트래킹 응답 바이트 절감 — 모든 응답에서 X-Powered-By 헤더 제거
	app.getHttpAdapter().getInstance().disable('x-powered-by');

	// 로컬 frontend(3000)에서의 브라우저 호출 허용
	app.enableCors({ origin: 'http://localhost:3000' });

	const configService = app.get<ConfigService>(ConfigService);
	const port = configService.get<number>('PORT');

	// 프록시(LB) 뒤 배포 시 X-Forwarded-For의 실제 클라이언트 IP를 쓰도록 한다(IP 기준 rate limit 전제)
	if (configService.get('TRUST_PROXY')) app.set('trust proxy', 1);

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
		// 어드민 API는 전역 JwtAuthGuard로 보호된다 — 컨트롤러마다 @ApiBearerAuth를 붙이는 대신 문서 전체에 기본 인증을 건다
		.addBearerAuth()
		.addSecurityRequirements('bearer')
		.build();
	SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, documentConfig));

	// SIGTERM/SIGINT에서 OnApplicationShutdown(Redis Stream 연결 종료 등)이 실행되도록 한다
	app.enableShutdownHooks();

	await app.listen(port ? port : 3000);
}
bootstrap();
