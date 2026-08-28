// 공개 포스트백 엔드포인트의 IP 기준 rate limit(429) e2e 검증.
// 트래킹에는 rate limit이 없다는 것도 함께 고정한다 — 기본 인메모리 저장소의 메모리·CPU 문제로
// 의도적으로 뺀 것이라 무심코 되살아나면 이 테스트가 깨져야 한다(근거는 tracking.controller.ts 주석).
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Throttler (e2e)', () => {
	let app: INestApplication<App>;

	beforeAll(async () => {
		// 소비 루프 없이 API만 기동하고, 한도는 테스트용으로 낮춘다(.env보다 process.env가 우선)
		process.env.APP_ROLE = 'api';
		process.env.THROTTLE_POSTBACK_LIMIT = '3';

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('포스트백은 한도(3회) 초과 시 429를 반환한다', async () => {
		for (let i = 0; i < 3; i++) {
			const res = await request(app.getHttpServer()).get('/appsflyer/install');
			expect(res.status).not.toBe(429);
		}

		await request(app.getHttpServer()).get('/appsflyer/install').expect(429);
	});

	it('트래킹은 한도가 없어 포스트백 한도(3회)를 넘겨 호출해도 429가 나오지 않는다', async () => {
		for (let i = 0; i < 5; i++) {
			const res = await request(app.getHttpServer()).get('/tracking');
			expect(res.status).not.toBe(429);
		}
	});

	it('가드가 없는 어드민·헬스 경로는 한도의 영향을 받지 않는다', async () => {
		for (let i = 0; i < 5; i++) {
			await request(app.getHttpServer()).get('/health').expect(200);
		}
	});
});
