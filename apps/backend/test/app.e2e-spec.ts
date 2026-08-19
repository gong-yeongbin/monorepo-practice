import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
	let app: INestApplication<App>;

	beforeEach(async () => {
		// 소비 루프 없이 API만 기동한다 — 헬스 체크에 컨슈머가 필요 없고, 열린 루프가 jest 종료를 막는다
		process.env.APP_ROLE = 'api';

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it('/health (GET)', () => {
		return request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' });
	});
});
