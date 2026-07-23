// 로컬 개발용 테스트 데이터를 생성하는 Prisma seed 스크립트 (pnpm seed 또는 pnpm reset 시 실행, upsert 기반이라 재실행해도 안전)
import { PrismaClient } from '@prisma/client';
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
		update: { password, approved: true },
		create: { email: 'admin@test.com', password, approved: true },
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
		await prisma.daily_report.upsert({
			where: { view_code_created_date: { view_code: viewCode, created_date: createdDate } },
			update: {},
			create: {
				view_code: viewCode,
				token: campaign.token,
				pub_id: 'seed_pub',
				sub_id: 'seed_sub',
				click: 100 + i * 10,
				install: 30 + i * 3,
				registration: 10 + i,
				purchase: 5 + i,
				revenue: (5 + i) * 1000,
				created_date: createdDate,
			},
		});
	}

	console.log(`seed 완료: user(admin@test.com / test1234!), advertiser·tracker·media·advertising·campaign(token=${campaign.token}), daily_report ${DAILY_REPORT_DAYS}일치`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
