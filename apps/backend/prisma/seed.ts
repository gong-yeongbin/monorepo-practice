// 로컬 개발용 테스트 데이터를 생성하는 Prisma seed 스크립트 (pnpm seed 또는 pnpm reset 시 실행, upsert 기반이라 재실행해도 안전)
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import { viewCodeCodec } from '../src/common/utils/view-code.util';
import { kstBaseDate } from '../src/common/utils/date.util';

// prisma.config.ts와 동일하게 .env를 직접 로드한다(.env 없는 환경은 셸 환경변수의 DATABASE_URL 사용)
try {
	process.loadEnvFile();
} catch {
	// .env가 없으면 무시
}

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL as string) });

const BCRYPT_SALT_ROUNDS = 10;
const DAILY_REPORT_DAYS = 7;

async function main() {
	// 1. 로그인 가능한 유저 — signup의 SES 인증과 approved 승인 절차를 우회한다
	const password = await bcrypt.hash('test1234!', BCRYPT_SALT_ROUNDS);
	await prisma.user.upsert({
		where: { email: 'admin@test.com' },
		update: { password, approved: true, role: 'DEVELOPER' },
		create: { email: 'admin@test.com', password, approved: true, role: 'DEVELOPER' },
	});

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

	// 5. advertising — advertiser·tracker 연결
	const advertising = await prisma.advertising.upsert({
		where: { name: '테스트 광고' },
		update: {},
		create: { name: '테스트 광고', advertiser_id: advertiser.id, tracker_id: tracker.id },
	});

	// 6. campaign — name이 unique가 아니라 findFirst 후 없을 때만 생성. token은 uuid 기본값으로 자동 생성된다
	let campaign = await prisma.campaign.findFirst({ where: { name: '테스트 캠페인' } });
	if (!campaign) {
		campaign = await prisma.campaign.create({
			data: {
				name: '테스트 캠페인',
				type: 'CPI',
				tracker_name: tracker.name,
				tracker_tracking_url: tracker.tracking_url,
				advertising_id: advertising.id,
				media_id: media.id,
			},
		});
	}

	// 7. campaign_config — 기본 install 매핑 + purchase 매핑
	const configs = [
		{ tracker_event_name: 'install', admin_event_name: 'install', media_event_name: 'install', send_media: true },
		{ tracker_event_name: 'af_complete_registration', admin_event_name: 'registration', media_event_name: 'registration', send_media: true },
		{ tracker_event_name: 'af_purchase', admin_event_name: 'purchase', media_event_name: 'purchase', send_media: true },
	];
	for (const config of configs) {
		await prisma.campaign_config.upsert({
			where: { campaign_id_admin_event_name: { campaign_id: campaign.id, admin_event_name: config.admin_event_name } },
			update: {},
			create: { campaign_id: campaign.id, ...config },
		});
	}

	// 8. daily_report — 최근 7일치 통계. view_code는 실제 트래킹과 동일하게 `token:pubId:subId`를 인코딩한 값
	const viewCode = viewCodeCodec.encode(`${campaign.token}:seed_pub:seed_sub`);
	const baseDate = kstBaseDate();
	for (let i = 0; i < DAILY_REPORT_DAYS; i++) {
		const createdDate = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
		// unregistered는 실제 파이프라인처럼 미등록 postback(af_login 1건/일) 건수와 일치시킨다.
		// 이미 seed된 행도 카운터가 seed 정의값과 동기화되도록 update에서도 갱신한다(9번의 postback 삭제 후 재생성과 짝을 맞춤)
		const counters = {
			click: 100 + i * 10,
			install: 30 + i * 3,
			registration: 10 + i,
			purchase: 5 + i,
			revenue: (5 + i) * 1000,
			unregistered: 1,
		};
		await prisma.daily_report.upsert({
			where: { view_code_created_date: { view_code: viewCode, created_date: createdDate } },
			update: counters,
			create: {
				view_code: viewCode,
				token: campaign.token,
				pub_id: 'seed_pub',
				sub_id: 'seed_sub',
				...counters,
				created_date: createdDate,
			},
		});
	}

	// 9. postback — 포스트백 로그 모달(인스톨·이벤트·미등록)용 로그. 건수를 daily_report의 install·registration·purchase·revenue와 일치시킨다.
	// unique 키가 없어 upsert 대신 seed 데이터(click_id 접두사)만 지우고 다시 넣는다
	await prisma.postback.deleteMany({ where: { click_id: { startsWith: 'seed_click_' } } });
	const MINUTE = 60 * 1000;
	const postbacks: Prisma.postbackCreateManyInput[] = [];
	for (let i = 0; i < DAILY_REPORT_DAYS; i++) {
		// baseDate(UTC 자정)는 KST 09:00라 +15시간 미만 오프셋은 같은 KST 일자에 머문다(로그 조회의 kstDayRange 범위와 일치)
		const dayStart = new Date(baseDate.getTime() - i * 24 * 60 * MINUTE);
		const at = (minutes: number) => new Date(dayStart.getTime() + minutes * MINUTE);
		const common = {
			tracker_name: tracker.name,
			pub_id: 'seed_pub',
			sub_id: 'seed_sub',
			view_code: viewCode,
			token: campaign.token,
			adid: 'seed-adid-0000',
			idfa: null,
			ip: '127.0.0.1',
			country_code: 'KR',
			raw_query_params: JSON.stringify({ seed: true }),
		};
		// 인스톨 — daily_report.install(30+3i)과 동일 건수 (event_name='install' + installed_at 기준 조회)
		for (let j = 0; j < 30 + i * 3; j++) {
			postbacks.push({
				...common,
				event_name: 'install',
				click_id: `seed_click_${i}_install_${j}`,
				clicked_at: at(j * 10),
				installed_at: at(j * 10 + 30),
			});
		}
		// 가입 — daily_report.registration(10+i)과 동일 건수. campaign_config가 af_complete_registration→registration으로 매핑 (evented_at 기준 조회)
		for (let j = 0; j < 10 + i; j++) {
			postbacks.push({
				...common,
				event_name: 'af_complete_registration',
				click_id: `seed_click_${i}_registration_${j}`,
				clicked_at: at(j * 10),
				evented_at: at(j * 10 + 60),
			});
		}
		// 구매 — daily_report.purchase(5+i)와 동일 건수, 건당 1000원이라 합계가 daily_report.revenue((5+i)*1000)와 일치
		for (let j = 0; j < 5 + i; j++) {
			postbacks.push({
				...common,
				event_name: 'af_purchase',
				click_id: `seed_click_${i}_purchase_${j}`,
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
			click_id: `seed_click_${i}_login`,
			clicked_at: dayStart,
			evented_at: at(120),
		});
	}
	await prisma.postback.createMany({ data: postbacks });

	console.log(
		`seed 완료: user(admin@test.com / test1234!), advertiser·tracker·media·advertising·campaign(token=${campaign.token}), daily_report ${DAILY_REPORT_DAYS}일치, postback ${postbacks.length}건`
	);
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
