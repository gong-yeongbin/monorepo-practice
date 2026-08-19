// 스트림 컨슈머 전용 엔트리포인트 — HTTP 서버 없이 AppModule 컨텍스트만 띄워 소비 루프를 돌린다
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	// dotenv는 이미 설정된 process.env를 덮어쓰지 않으므로 .env의 APP_ROLE보다 이 값이 우선한다
	process.env.APP_ROLE = 'consumer';

	const app = await NestFactory.createApplicationContext(AppModule);

	// SIGTERM/SIGINT에서 소비 루프가 in-flight 배치를 마치고 종료되도록 한다
	app.enableShutdownHooks();
}
bootstrap();
