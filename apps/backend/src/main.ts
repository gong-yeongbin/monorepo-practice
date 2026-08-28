import { createServer } from 'http';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';

// 트래킹 포트(NLB 경유)로 받을 공개 경로. NLB는 L4라 경로를 못 거르므로 ALB 리스너 규칙이 하던 일을 앱이 대신한다.
// 이 목록을 넓히면 그만큼 어드민 API가 평문 80에 노출된다.
// /health는 ECS가 NLB 타깃 그룹 헬스체크에 쓰므로 빠지면 태스크가 영구 unhealthy로 교체를 반복한다.
const TRACKING_PUBLIC_PATHS = /^\/(tracking|health|[^/]+\/(install|event))\/?$/;

const TRACKING_PORT_DEFAULT = 3002;

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// 트래킹 응답 바이트 절감 — 모든 응답에서 X-Powered-By 헤더 제거
	app.getHttpAdapter().getInstance().disable('x-powered-by');

	// 로컬 frontend(3000)에서의 브라우저 호출 허용
	app.enableCors({ origin: 'http://localhost:3000' });

	const configService = app.get<ConfigService>(ConfigService);
	const port = configService.get<number>('PORT');

	const trackingPort = Number(configService.get('TRACKING_PORT')) || TRACKING_PORT_DEFAULT;

	// L7 프록시(ALB) 뒤에서 X-Forwarded-For의 실제 클라이언트 IP를 쓰도록 한다(IP 기준 rate limit 전제).
	// 주의: 트래킹은 NLB(L4) 경유라 XFF를 붙여주는 주체가 없다 — 켜면 클라이언트가 헤더를 위조해
	// rate limit을 그대로 우회한다. NLB 타깃 그룹의 preserve_client_ip가 소켓 주소를 실제 클라이언트 IP로
	// 보존하므로 헤더가 애초에 필요 없고, 그래서 prod 환경변수에도 주입하지 않는다.
	if (configService.get('TRUST_PROXY')) app.set('trust proxy', 1);

	// 진입 포트로 역할을 가른다 — 트래킹 포트에서는 공개 경로만, 어드민 포트(PORT)에서는 전부.
	app.use((req: Request, res: Response, next: NextFunction) => {
		if (req.socket.localPort === trackingPort && !TRACKING_PUBLIC_PATHS.test(req.path)) {
			res.writeHead(404).end();
			return;
		}
		next();
	});

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

	// 같은 express 인스턴스를 두 번째 서버로 노출한다 — 이미지도 프로세스도 하나다.
	// enableShutdownHooks는 Nest가 만든 서버만 닫으므로 이 서버를 남겨두면 SIGTERM 이후에도
	// 열린 핸들 때문에 프로세스가 끝나지 않아 ECS가 SIGKILL할 때까지 배포가 지연된다.
	const trackingServer = createServer(app.getHttpAdapter().getInstance());
	trackingServer.listen(trackingPort);
	process.once('SIGTERM', () => trackingServer.close());
	process.once('SIGINT', () => trackingServer.close());
}
bootstrap();
