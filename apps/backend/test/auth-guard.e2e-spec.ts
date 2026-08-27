// 전역 JwtAuthGuard·RolesGuard가 공개 라우트는 열고 역할별 어드민 API는 막는지 e2e 검증
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

const ACCESS_SECRET = 'e2e-access-secret';

describe('AuthGuard (e2e)', () => {
	let app: INestApplication<App>;
	let sign: (role: string) => string;

	beforeAll(async () => {
		// 소비 루프 없이 API만 기동한다. ConfigModule은 기존 process.env를 덮어쓰지 않아 여기 지정한 시크릿이 그대로 쓰인다.
		process.env.APP_ROLE = 'api';
		process.env.JWT_ACCESS_SECRET = ACCESS_SECRET;

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		const jwtService = app.get(JwtService);
		sign = (role: string) => jwtService.sign({ sub: 1, email: 'e2e@test.com', role }, { secret: ACCESS_SECRET });
	});

	afterAll(async () => {
		await app.close();
	});

	// 가드는 컨트롤러·Prisma보다 먼저 실행되므로 401·403 판정에는 DB 데이터가 필요 없다.
	// 통과하는 경우는 상태 코드가 라우트 로직에 달려 있어 "401·403이 아님"만 확인한다.
	describe('@Public 라우트는 토큰 없이 열린다', () => {
		it('GET /health', () => request(app.getHttpServer()).get('/health').expect(200));

		it('GET /tracking', async () => {
			const res = await request(app.getHttpServer()).get('/tracking');
			expect(res.status).not.toBe(401);
			expect(res.status).not.toBe(403);
		});

		it('GET /:name/install', async () => {
			const res = await request(app.getHttpServer()).get('/appsflyer/install');
			expect(res.status).not.toBe(401);
			expect(res.status).not.toBe(403);
		});
	});

	describe('어드민 API는 유효한 access token을 요구한다', () => {
		it('토큰이 없으면 401', () => request(app.getHttpServer()).get('/dashboard').expect(401));

		it('서명이 깨진 토큰이면 401', () => request(app.getHttpServer()).get('/dashboard').set('Authorization', 'Bearer garbage').expect(401));
	});

	describe('역할별 접근 범위', () => {
		it('USER는 광고 운영 API에 접근할 수 없다', () => request(app.getHttpServer()).get('/media').set('Authorization', `Bearer ${sign('USER')}`).expect(403));

		it('ADMIN은 사용자 관리 API에 접근할 수 없다', () => request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${sign('ADMIN')}`).expect(403));

		it('DEVELOPER는 사용자 관리 API에 접근할 수 있다', async () => {
			const res = await request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${sign('DEVELOPER')}`);
			expect(res.status).not.toBe(403);
		});

		it('USER는 대시보드에 접근할 수 있다', async () => {
			// 이 테스트 앱에는 main.ts의 전역 ValidationPipe가 없어 쿼리가 그대로 흘러가므로 date를 채워 보낸다
			const res = await request(app.getHttpServer()).get('/dashboard?date=2026-08-27').set('Authorization', `Bearer ${sign('USER')}`);
			expect(res.status).not.toBe(403);
		});

		// 대시보드 상세 화면의 InfoCard가 쓰는 단건 조회만 USER에게 열려 있고, 목록·쓰기는 닫혀 있어야 한다
		it('USER는 advertising 단건 조회는 할 수 있다', async () => {
			const res = await request(app.getHttpServer()).get('/advertising/1').set('Authorization', `Bearer ${sign('USER')}`);
			expect(res.status).not.toBe(403);
		});

		it('USER는 advertising 목록은 조회할 수 없다', () =>
			request(app.getHttpServer()).get('/advertising').set('Authorization', `Bearer ${sign('USER')}`).expect(403));

		it('USER는 advertising 이미지를 업로드할 수 없다', () =>
			request(app.getHttpServer()).post('/advertising/1/image').set('Authorization', `Bearer ${sign('USER')}`).expect(403));

		// 상세·일별 화면의 install·event·미등록 팝업이 쓰는 조회 API
		it('USER는 포스트백 로그를 조회할 수 있다', async () => {
			const res = await request(app.getHttpServer()).get('/postbacks/install').set('Authorization', `Bearer ${sign('USER')}`);
			expect(res.status).not.toBe(403);
		});
	});
});
