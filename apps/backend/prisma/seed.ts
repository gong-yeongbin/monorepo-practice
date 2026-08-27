// 로컬 개발용 테스트 데이터를 생성하는 Prisma seed 스크립트 (pnpm seed 또는 pnpm reset 시 실행, upsert 기반이라 재실행해도 안전)
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { viewCodeCodec } from '../src/common/utils/view-code.util';
import { kstBaseDate } from '../src/common/utils/date.util';

// prisma.config.ts와 동일하게 .env를 직접 로드한다(.env 없는 환경은 셸 환경변수의 DATABASE_URL 사용)
try {
	process.loadEnvFile();
} catch {
	// .env가 없으면 무시
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }) });

const BCRYPT_SALT_ROUNDS = 10;
const DAILY_REPORT_DAYS = 7;

async function main() {
	// 1. 로그인 가능한 유저 — signup의 SES 인증과 approved 승인 절차를 우회한다.
	// 역할별 접근 범위(USER는 대시보드만, ADMIN은 광고 운영, DEVELOPER는 사용자 관리까지)를 바로 확인할 수 있게 계정을 나눠 둔다.
	const password = await bcrypt.hash('test1234!', BCRYPT_SALT_ROUNDS);
	const seedUsers = [
		{ email: 'admin@test.com', role: 'DEVELOPER' as const, approved: true },
		{ email: 'ops@test.com', role: 'ADMIN' as const, approved: true },
		{ email: 'viewer@test.com', role: 'USER' as const, approved: true },
		// 승인 API(GET /users?approved=false → PATCH /users/:id) 검증용 미승인 계정
		{ email: 'pending@test.com', role: 'USER' as const, approved: false },
	];
	for (const seedUser of seedUsers) {
		await prisma.user.upsert({
			where: { email: seedUser.email },
			update: { password, approved: seedUser.approved, role: seedUser.role },
			create: { ...seedUser, password },
		});
	}

	// 2~4. FK 없는 기본 엔티티
	const advertiser = await prisma.advertiser.upsert({
		where: { name: '테스트 광고주' },
		update: {},
		create: { name: '테스트 광고주' },
	});

	const tracker = await prisma.tracker.upsert({
		where: { name: 'appsflyer' },
		update: {},
		create: {
			name: 'appsflyer',
			tracking_url: 'https://app.appsflyer.com/com.example.app',
			install_postback_url: 'https://backend.example.com/appsflyer/install',
			event_postback_url: 'https://backend.example.com/appsflyer/event',
		},
	});

	const media = await prisma.media.upsert({
		where: { name: '테스트 매체' },
		update: {},
		create: {
			name: '테스트 매체',
			install_postback_url: 'https://media.example.com/install?click_id={click_id}',
			event_postback_url: 'https://media.example.com/event?click_id={click_id}&event={event}',
		},
	});

	// 5. advertising — advertiser·tracker 연결 (2개)
	const upsertAdvertising = (name: string) =>
		prisma.advertising.upsert({
			where: { name },
			update: {},
			create: { name, advertiser_id: advertiser.id, tracker_id: tracker.id },
		});
	// 이름의 (AOS)/(iOS)는 frontend platformFromName이 플랫폼 컬럼으로 표시한다
	const advertising1 = await upsertAdvertising('카페 러시(AOS)');
	const advertising2 = await upsertAdvertising('펫 월드(iOS)');

	// 5-1. user_advertising — 허용 목록이 비면 USER는 아무 광고도 못 보므로(스코핑 기본값) 조회 확인용 계정을 연결한다.
	// viewer에 카페 러시만 걸어 두면 펫 월드가 안 보이는지로 스코핑이 실제로 동작하는지 바로 검증된다.
	// admin(DEVELOPER)·ops(ADMIN)는 스코핑 면제라 연결하지 않는다. pending은 승인 화면에서 직접 지정해 보는 용도라 비워 둔다.
	const viewer = await prisma.user.findUnique({ where: { email: 'viewer@test.com' } });
	if (viewer) {
		// upsert 대신 전건 삭제 후 삽입 — 재실행해도 중복 없이 같은 상태가 된다
		await prisma.user_advertising.deleteMany({ where: { user_id: viewer.id } });
		await prisma.user_advertising.create({ data: { user_id: viewer.id, advertising_id: advertising1.id } });
	}

	// 6. campaign — advertising마다 2개. name이 unique가 아니라 findFirst 후 없을 때만 생성.
	// token은 http/의 .http 예시가 그대로 실행되도록 고정값을 쓴다(uuid 자동 생성이면 재시드마다 달라져 예시와 어긋남).
	// 기존 행의 token도 고정값으로 갱신한다 — 이전 uuid token으로 쌓인 daily_report·postback 행은 고아가 되므로 pnpm reset으로 정리하는 걸 권장.
	const findOrCreateCampaign = async (name: string, advertising_id: number, token: string) => {
		const found = await prisma.campaign.findFirst({ where: { name } });
		if (found) {
			return found.token === token ? found : prisma.campaign.update({ where: { id: found.id }, data: { token } });
		}
		return prisma.campaign.create({
			data: {
				name,
				token,
				type: 'CPI',
				tracker_name: tracker.name,
				tracker_tracking_url: tracker.tracking_url,
				advertising_id,
				media_id: media.id,
			},
		});
	};
	// 통계·포스트백·예약 시드는 첫 캠페인에만 건다
	const campaign = await findOrCreateCampaign('카페 러시 론칭 캠페인', advertising1.id, 'seed-token-cafe-launch');
	const campaigns = [
		campaign,
		await findOrCreateCampaign('카페 러시 부스트 캠페인', advertising1.id, 'seed-token-cafe-boost'),
		await findOrCreateCampaign('펫 월드 론칭 캠페인', advertising2.id, 'seed-token-pet-launch'),
		await findOrCreateCampaign('펫 월드 부스트 캠페인', advertising2.id, 'seed-token-pet-boost'),
	];

	// 7. campaign_config — 모든 캠페인에 기본 install 매핑 + 가입·구매 매핑
	const configs = [
		{ tracker_event_name: 'install', admin_event_name: 'install', media_event_name: 'install', send_media: true },
		{ tracker_event_name: 'af_complete_registration', admin_event_name: 'registration', media_event_name: 'registration', send_media: true },
		{ tracker_event_name: 'af_purchase', admin_event_name: 'purchase', media_event_name: 'purchase', send_media: true },
	];
	for (const target of campaigns) {
		for (const config of configs) {
			await prisma.campaign_config.upsert({
				where: { campaign_id_admin_event_name: { campaign_id: target.id, admin_event_name: config.admin_event_name } },
				update: {},
				create: { campaign_id: target.id, ...config },
			});
		}
	}

	// 8~9. campaign마다 daily_report 7일치 + postback 로그. 캠페인별 규모(factor)를 다르게 해 화면 구분이 쉽다.
	// view_code는 실제 트래킹과 동일하게 `token:pubId:subId`를 인코딩한 값이고,
	// postback 건수는 daily_report의 install·registration·purchase·revenue와 일치시킨다.
	// postback은 unique 키가 없어 upsert 대신 seed 데이터(click_id 접두사)만 지우고 다시 넣는다
	const baseDate = kstBaseDate();
	await prisma.postback.deleteMany({ where: { click_id: { startsWith: 'seed_click_' } } });
	const MINUTE = 60 * 1000;
	const postbacks: Prisma.postbackCreateManyInput[] = [];
	for (const [c, target] of campaigns.entries()) {
		const viewCode = viewCodeCodec.encode(`${target.token}:seed_pub:seed_sub`);
		const factor = [1, 0.6, 0.4, 0.2][c] ?? 1;
		for (let i = 0; i < DAILY_REPORT_DAYS; i++) {
			const createdDate = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
			const install = Math.round((30 + i * 3) * factor);
			const registration = Math.round((10 + i) * factor);
			const purchase = Math.round((5 + i) * factor);
			// unregistered는 실제 파이프라인처럼 미등록 postback(af_login 1건/일) 건수와 일치시킨다.
			// 이미 seed된 행도 카운터가 seed 정의값과 동기화되도록 update에서도 갱신한다(postback 삭제 후 재생성과 짝을 맞춤)
			const counters = {
				click: Math.round((100 + i * 10) * factor),
				install,
				registration,
				purchase,
				revenue: purchase * 1000,
				unregistered: 1,
			};
			await prisma.daily_report.upsert({
				where: { view_code_created_date: { view_code: viewCode, created_date: createdDate } },
				update: counters,
				create: {
					view_code: viewCode,
					token: target.token,
					pub_id: 'seed_pub',
					sub_id: 'seed_sub',
					...counters,
					created_date: createdDate,
				},
			});

			// baseDate(UTC 자정)는 KST 09:00라 +15시간 미만 오프셋은 같은 KST 일자에 머문다(로그 조회의 kstDayRange 범위와 일치)
			const dayStart = createdDate;
			const at = (minutes: number) => new Date(dayStart.getTime() + minutes * MINUTE);
			const common = {
				tracker_name: tracker.name,
				pub_id: 'seed_pub',
				sub_id: 'seed_sub',
				view_code: viewCode,
				token: target.token,
				adid: 'seed-adid-0000',
				idfa: null,
				ip: '127.0.0.1',
				country_code: 'KR',
				raw_query_params: JSON.stringify({ seed: true }),
			};
			// 인스톨 — daily_report.install과 동일 건수 (event_name='install' + installed_at 기준 조회)
			for (let j = 0; j < install; j++) {
				postbacks.push({
					...common,
					event_name: 'install',
					click_id: `seed_click_${c}_${i}_install_${j}`,
					clicked_at: at(j * 10),
					installed_at: at(j * 10 + 30),
				});
			}
			// 가입 — daily_report.registration과 동일 건수. campaign_config가 af_complete_registration→registration으로 매핑 (evented_at 기준 조회)
			for (let j = 0; j < registration; j++) {
				postbacks.push({
					...common,
					event_name: 'af_complete_registration',
					click_id: `seed_click_${c}_${i}_registration_${j}`,
					clicked_at: at(j * 10),
					evented_at: at(j * 10 + 60),
				});
			}
			// 구매 — daily_report.purchase와 동일 건수, 건당 1000원이라 합계가 daily_report.revenue와 일치
			for (let j = 0; j < purchase; j++) {
				postbacks.push({
					...common,
					event_name: 'af_purchase',
					click_id: `seed_click_${c}_${i}_purchase_${j}`,
					clicked_at: at(j * 10),
					evented_at: at(j * 10 + 90),
					revenue_currency: 'KRW',
					revenue: '1000',
				});
			}
			// 미등록 이벤트 1건 — campaign_config에 없는 이벤트명이라 미등록 모달에 집계된다 (daily_report에는 집계되지 않는 값)
			postbacks.push({
				...common,
				event_name: 'af_login',
				click_id: `seed_click_${c}_${i}_login`,
				clicked_at: dayStart,
				evented_at: at(120),
			});
		}
	}
	await prisma.postback.createMany({ data: postbacks });

	// 10. reservation — 예약 변경 화면용. 자연키가 없어 시드 접두사로 지우고 다시 만든다(9번 postback과 같은 패턴)
	await prisma.reservation.deleteMany({ where: { name: { startsWith: '시드 예약' } } });
	const now = kstBaseDate();
	await prisma.reservation.createMany({
		data: [
			{
				campaign_id: campaign.id,
				name: '시드 예약(대기)',
				tracking_url: 'https://app.appsflyer.com/com.example.app?pid=reserved',
				reserved_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
				is_applied: false,
			},
			{
				campaign_id: campaign.id,
				name: '시드 예약(완료)',
				tracking_url: 'https://app.appsflyer.com/com.example.app?pid=applied',
				reserved_at: new Date(now.getTime() - 24 * 60 * 60 * 1000),
				is_applied: true,
			},
		],
	});

	console.log(
		`seed 완료: user 4개(admin=DEVELOPER / ops=ADMIN / viewer=USER · 카페 러시만 허용 / pending=미승인, 전부 @test.com · test1234!), advertiser·tracker·media, advertising 2개·campaign 4개, daily_report 캠페인당 ${DAILY_REPORT_DAYS}일치, postback ${postbacks.length}건, reservation 2건`
	);
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
