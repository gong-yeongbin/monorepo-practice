// 로컬 개발용 테스트 데이터를 생성하는 Prisma seed 스크립트 (pnpm seed 또는 pnpm reset 시 실행, upsert 기반이라 재실행해도 안전)
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { viewCodeCodec } from '../src/common/utils/view-code.util';
import { kstBaseDate } from '../src/common/utils/date.util';
import { TRACKERS } from '../src/trackers/tracker.registry';
import { createPostback } from '../src/modules/postback/domain/postback.entity';
import { buildPostbackSamples } from './postback-samples';

// prisma.config.ts와 동일하게 .env를 직접 로드한다(.env 없는 환경은 셸 환경변수의 DATABASE_URL 사용)
try {
	process.loadEnvFile();
} catch {
	// .env가 없으면 무시
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }) });

const BCRYPT_SALT_ROUNDS = 10;
const DAILY_REPORT_DAYS = 7;

// 트래커 5곳의 링크·포스트백 템플릿 — 운영 DB(mcpro.tracker)의 값을 그대로 옮겼다(name만 아래 주석대로 맞춤).
// 그대로 넣은 결과 클릭 치환(tracking.use-case.ts) 기준으로 두 가지가 따라온다.
//   - {app_id}·{app_key}·{tracker_id}·{appkey}·{app_subdomain}·{pid}는 광고별로 채우는 자리라 치환에서 빈 문자열이 된다.
//   - adjust 링크는 install_callback·event_callback을 품고 있어 콜백 안의 adjust 매크로까지 함께 지워진다.
// 레거시의 idx·type·status 컬럼은 이 스키마에 없어 옮기지 않았다.
const TRACKER_SEEDS = [
	{
		name: 'appsflyer',
		tracking_url:
			'https://app.appsflyer.com/{app_id}?pid=mecrosspro_int&clickid={clickid}&af_siteid={af_siteid}&af_c_id={af_c_id}&af_adset_id={af_adset_id}&af_ad_id={af_ad_id}&advertising_id={advertising_id}&idfa={idfa}&af_ip={af_ip}&af_ua={af_ua}&af_lang={af_lang}',
		install_postback_url:
			'http://api.mecrosspro.com/appsflyer/install?clickid={clickid}&af_siteid={af_siteid}&af_c_id={af_c_id}&advertising_id={advertising_id}&idfa={idfa}&idfv={idfv}&install_time={install_time}&country_code={country_code}&language={language}&click_time={click_time}&device_carrier={device_carrier}&device_ip={device_ip}',
		event_postback_url:
			'http://api.mecrosspro.com/appsflyer/event?clickid={clickid}&af_siteid={af_siteid}&af_c_id={af_c_id}&advertising_id={advertising_id}&idfa={idfa}&idfv={idfv}&install_time={install_time}&country_code={country_code}&language={language}&event_name={event_name}&event_revenue_currency={event_revenue_currency}&event_revenue={event_revenue}&event_time={event_time}&device_carrier={device_carrier}&device_ip={device_ip}',
	},
	{
		// 레거시 name은 adbrixremaster지만 TRACKERS 레지스트리 키에 맞춘다 — 이 값이 campaign.tracker_name이 되고
		// 클릭 시 TRACKERS[tracker_name] 조회에 쓰인다. 원본도 포스트백 수신 경로는 /adbrix-remaster/를 쓴다.
		name: 'adbrix-remaster',
		tracking_url:
			'https://{app_key}.adtouch.adbrix.io/api/v1/click/{tracker_id}?cb_1={cb_1}&cb_2={cb_2}&cb_3={cb_3}&cb_4={cb_4}&cb_5={cb_5}&m_publisher={m_publisher}&m_sub_publisher={m_sub_publisher}&m_adid={m_adid}',
		install_postback_url:
			'http://api.mecrosspro.com/adbrix-remaster/install?a_key={a_key}&a_cookie={a_cookie}&a_ip={a_ip}&a_fp={a_fp}&a_country={a_country}&a_city={a_city}&a_region={a_region}&a_appkey={a_appkey}&m_publisher={m_publisher}&m_sub_publisher={m_sub_publisher}&adid={req.common.identity.adid}&idfv={req.common.identity.idfv}&ad_id_opt_out={req.common.identity.ad_id_opt_out}&device_os_version={req.common.device_info.os}&device_model={req.common.device_info.model}&device_vendor={req.common.device_info.vendor}&device_resolution={req.common.device_info.resolution}&device_portrait={req.common.device_info.is_portrait}&device_platform={req.common.device_info.platform}&device_network={req.common.device_info.network}&device_wifi={req.common.device_info.is_wifi_only}&device_carrier={req.common.device_info.carrier}&device_language={req.common.device_info.language}&device_country={req.common.device_info.country}&device_build_id={req.common.build_id}&package_name={req.common.package_name}&appkey={req.common.appkey}&sdk_version={req.common.sdk_version}&installer={req.common.installer}&app_version={req.common.app_version}&attr_type={attr_type}&event_name={event_name}&event_datetime={req.evt.event_datetime}&deeplink_path={deeplink_custom_path}&market_install_btn_clicked={req.evt.param.market_install_btn_clicked}&app_install_start={req.evt.param.app_install_start}&app_install_completed={req.evt.param.app_install_completed}&app_first_open={req.evt.param.app_first_open}&seconds_gap={seconds_gap}&cb_1={cb_1}&cb_2={cb_2}&cb_3={cb_3}&cb_4={cb_4}&cb_5={cb_5}&a_server_datetime={a_adtouch_datetime}',
		event_postback_url:
			'http://api.mecrosspro.com/adbrix-remaster/event?a_key={first_install.a_key}&a_cookie={first_install.a_cookie}&a_ip={first_install.a_ip}&a_fp={first_install.a_fp}&a_country={first_install.a_country}&a_city={first_install.a_city}&a_region={first_install.a_region}&a_appkey={first_install.a_appkey}&m_publisher={first_install.m_publisher}&m_sub_publisher={first_install.m_sub_publisher}&attr_adid={first_install.adid}&attr_event_datetime={first_install.attribute_datetime}&attr_event_timestamp={first_install.attribute_timestamp}&attr_seconds_gap={first_install.seconds_gap}&adid={req.common.identity.adid}&idfv={req.common.identity.idfv}&ad_id_opt_out={req.common.identity.ad_id_opt_out}&device_os_version={req.common.device_info.os}&device_model={req.common.device_info.model}&device_vendor={req.common.device_info.vendor}&device_resolution={req.common.device_info.resolution}&device_portrait={req.common.device_info.is_portrait}&device_platform={req.common.device_info.platform}&device_network={req.common.device_info.network}&device_wifi={req.common.device_info.is_wifi_only}&device_carrier={req.common.device_info.carrier}&device_language={req.common.device_info.language}&device_country={req.common.device_info.country}&device_build_id={req.common.build_id}&package_name={req.common.package_name}&appkey={req.common.appkey}&sdk_version={req.common.sdk_version}&installer={req.common.installer}&app_version={req.common.app_version}&event_name={req.evt.event_name}&event_datetime={req.evt.event_datetime}&event_timestamp={req.evt.event_timestamp}&event_timestamp_d={req.evt.event_timestamp_d}&param_json={req.evt.param_json}&cb_1={first_install.cb_1}&cb_2={first_install.cb_2}&cb_3={first_install.cb_3}&cb_4={first_install.cb_4}&cb_5={first_install.cb_5}',
	},
	{
		name: 'adjust',
		tracking_url:
			'https://app.adjust.com/{appkey}?adgroup={publisher_id}&install_callback=http://api.mecrosspro.com/adjust/install?cp_token={cp_token}&publisher_id={publisher_id}&click_id={click_id}&uid={uid}&app_id={app_id}&app_version={app_version}&network_name={network_name}&campaign_name={campaign_name}&adgroup_name={adgroup_name}&adid={adid}&idfa={idfa}&idfv={idfv}&android_id={android_id}&gps_adid={gps_adid}&ip_address={ip_address}&click_time={click_time}&engagement_time={engagement_time}&installed_at={installed_at}&isp={isp}&country={country}&language={language}&device_name={device_name}&device_type={device_type}&os_name={os_name}&sdk_version={sdk_version}&os_version={os_version}&event_callback_{event_token}=http://api.mecrosspro.com/adjust/event?event_token={event_token}&event_type={event_type}&cp_token={cp_token}&publisher_id={publisher_id}&click_id={click_id}&uid={uid}&app_id={app_id}&app_version={app_version}&network_name={network_name}&campaign_name={campaign_name}&adgroup_name={adgroup_name}&adid={adid}&idfa={idfa}&idfv={idfv}&android_id={android_id}&gps_adid={gps_adid}&ip_address={ip_address}&click_time={click_time}&engagement_time={engagement_time}&installed_at={installed_at}&created_at={created_at}&isp={isp}&country={country}&language={language}&device_name={device_name}&device_type={device_type}&os_name={os_name}&sdk_version={sdk_version}&os_version={os_version}&currency={currency}&revenue={revenue}&revenue_float={revenue_float}&revenue_usd={revenue_usd}&revenue_usd_cents={revenue_usd_cents}&reporting_revenue={reporting_revenue}&reporting_currency={reporting_currency}',
		install_postback_url:
			'http://api.mecrosspro.com/adjust/install?cp_token={cp_token}&publisher_id={publisher_id}&click_id={click_id}&uid={uid}&app_id={app_id}&app_version={app_version}&network_name={network_name}&campaign_name={campaign_name}&adgroup_name={adgroup_name}&adid={adid}&idfa={idfa}&idfv={idfv}&android_id={android_id}&gps_adid={gps_adid}&ip_address={ip_address}&click_time={click_time}&engagement_time={engagement_time}&installed_at={installed_at}&isp={isp}&country={country}&language={language}&device_name={device_name}&device_type={device_type}&os_name={os_name}&sdk_version={sdk_version}&os_version={os_version}',
		event_postback_url:
			'http://api.mecrosspro.com/adjust/event?event_token={event_token}&event_type={event_type}&cp_token={cp_token}&publisher_id={publisher_id}&click_id={click_id}&uid={uid}&app_id={app_id}&app_version={app_version}&network_name={network_name}&campaign_name={campaign_name}&adgroup_name={adgroup_name}&adid={adid}&idfa={idfa}&idfv={idfv}&android_id={android_id}&gps_adid={gps_adid}&ip_address={ip_address}&click_time={click_time}&engagement_time={engagement_time}&installed_at={installed_at}&created_at={created_at}&isp={isp}&country={country}&language={language}&device_name={device_name}&device_type={device_type}&os_name={os_name}&sdk_version={sdk_version}&os_version={os_version}&currency={currency}&revenue={revenue}&revenue_float={revenue_float}&revenue_usd={revenue_usd}&revenue_usd_cents={revenue_usd_cents}&reporting_revenue={reporting_revenue}&reporting_currency={reporting_currency}',
	},
	{
		name: 'airbridge',
		tracking_url:
			'https://abr.ge/@{app_subdomain}/mecrosspro?click_id={click_id}&sub_id={publisher_id}&sub_id_1={sub_id_1}&gaid_raw={gaid}&ifa_raw={idfa}&custom_param1={custom_param1}&custom_param2={custom_param2}&custom_param3={custom_param3}&custom_param4={custom_param4}&custom_param5={custom_param5}&campaign={campaign}&ad_group={ad_group}&ad_creative={ad_creative}',
		install_postback_url:
			'http://api.mecrosspro.com/airbridge/install?click_id={attributionResult.attributedClickID}&sub_id={attributionResult.attributedSubPublisher}&uuid={device.deviceUUID}&google_aid={device.gaid}&ios_idfa={device.ifa}&ios_ifv={device.ifv}&limitAdTracking={device.limitAdTracking}&device_model={device.deviceModel}&device_manufacturer={device.manufacturer}&device_type={device.deviceType}&os={device.osName}&os_version={device.osVersion}&locale={device.locale}&language={device.language}&country={device.country}&device_carrier={device.network.carrier}&timezone={device.timezone}&device_ip={device.clientIP}&packageName={app.packageName}&iTunesAppID={app.iTunesAppID}&appVersion={app.version}&appName={app.appName}&sdkVersion={sdkVersion}&isUnique={eventData.isFirstPerDevice}&event_datetime={eventDatetime}&event_timestamp={eventTimestamp}&install_timestamp={eventData.systemInstallTimestamp}&click_datetime={attributionResult.attributedDatetime}&click_timestamp={attributionResult.attributedTimestamp}&deeplink={eventData.deeplink}&googleReferrer={eventData.googleReferrer}&attributedChannel={attributionResult.attributedChannel}&attributedMatchingType={attributionResult.attributedMatchingType}&custom_param1={@trackingLink.custom_param1}&custom_param2={@trackingLink.custom_param2}&custom_param3={@trackingLink.custom_param3}&custom_param4={@trackingLink.custom_param4}&custom_param5={@trackingLink.custom_param5}',
		event_postback_url:
			'http://api.mecrosspro.com/airbridge/event?click_id={attributionResult.attributedClickID}&sub_id={attributionResult.attributedSubPublisher}&uuid={device.deviceUUID}&google_aid={device.gaid}&ios_idfa={device.ifa}&ios_ifv={device.ifv}&limitAdTracking={device.limitAdTracking}&device_model={device.deviceModel}&device_manufacturer={device.manufacturer}&os={device.osName}&os_version={device.osVersion}&locale={device.locale}&language={device.language}&country={device.country}&device_carrier={device.network.carrier}&timezone={device.timezone}&device_ip={device.clientIP}&packageName={app.packageName}&iTunesAppID={app.iTunesAppID}&appVersion={app.version}&appName={app.appName}&sdkVersion={sdkVersion}&event_type={attributionResult.attributedTargetEventName}&isUnique={eventData.isFirstPerDevice}&event_datetime={eventDatetime}&event_timestamp={eventTimestamp}&install_timestamp={eventData.systemInstallTimestamp}&click_datetime={attributionResult.attributedDatetime}&click_timestamp={attributionResult.attributedTimestamp}&deeplink={eventData.deeplink}&googleReferrer={eventData.googleReferrer}&category={eventData.category}&eventName={@postback.eventName}&eventLabel={eventData.label}&eventValue={eventData.value}&inAppPurchased={eventData.goal.semanticAttributes.inAppPurchased}&transactionID={eventData.goal.semanticAttributes.transactionID}&product_info={@postback.jsonData}&attributedChannel={attributionResult.attributedChannel}&campaign={attributionResult.attributedCampaign}&ad_type={attributionResult.attributedActionType}&ad_group={attributionResult.attributedAdGroup}&ad_creative={attributionResult.attributedAdCreative}&attributedMatchingType={attributionResult.attributedMatchingType}&custom_param1={@trackingLink.custom_param1}&custom_param2={@trackingLink.custom_param2}&custom_param3={@trackingLink.custom_param3}&custom_param4={@trackingLink.custom_param4}&custom_param5={@trackingLink.custom_param5}',
	},
	{
		// 포스트백 URL의 sub1~sub5는 콘솔 템플릿에 없던 값이 아니라 실제 수신 URL에서 확인한 것이다
		// (sub4·sub5만 미치환 리터럴로 돌아와 소문자 매크로 표기임을 알 수 있다).
		name: 'singular',
		tracking_url:
			'https://singularassist.sng.link/{pid}/{app_id}?idfa={idfa}&aifa={gaid}&pcid={campaignId}&pscn={campaignName}&pcn={campaignName}&cl={click_id}&sub1={token}&sub2={view_code}&sub3={sub3}&sub5={sub5}',
		install_postback_url:
			'http://api.mecrosspro.com/singular/install?attribution_ip={ATTRIBUTION_IP}&os_version={OS_VERSION}&app_version={APP_VERSION}&idfa={IDFA}&idfv={IDFV}&gaid={AIFA}&attribution_country={ATTRIBUTION_COUNTRY}&platform={PLATFORM}&time={TIME}&utc={UTC}&click_time={CLICK_TIME}&click_utc={CLICK_UTC}&sub1={sub1}&sub2={sub2}&sub3={sub3}&sub4={sub4}&sub5={sub5}',
		event_postback_url:
			'http://api.mecrosspro.com/singular/event?attribution_ip={ATTRIBUTION_IP}&os_version={OS_VERSION}&app_version={APP_VERSION}&idfa={IDFA}&idfv={IDFV}&gaid={AIFA}&attribution_country={ATTRIBUTION_COUNTRY}&platform={PLATFORM}&amount={AMOUNT}&currency={CURRENCY}&event_name={EVTNAME}&event_attrs={EVTATTRS}&time={TIME}&utc={UTC}&install_time={INSTALL_TIME}&install_utc={INSTALL_UTC}&sub1={sub1}&sub2={sub2}&sub3={sub3}&sub4={sub4}&sub5={sub5}',
	},
];

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

	// 다른 엔티티와 달리 update에도 값을 넣어 TRACKER_SEEDS 수정이 재시드로 반영되게 한다.
	// (이미 만들어진 campaign.tracker_tracking_url은 생성 시점 복사본이라 그대로 남는다 — 새 템플릿을 보려면 pnpm reset)
	const trackers = await Promise.all(TRACKER_SEEDS.map((seedTracker) => prisma.tracker.upsert({ where: { name: seedTracker.name }, update: seedTracker, create: seedTracker })));

	// advertising·campaign은 기존대로 appsflyer에 건다
	const tracker = trackers.find((row) => row.name === 'appsflyer')!;

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

	// 9-1. 트래커 원본 쿼리로 만든 postback 샘플 — 위 8~9번의 합성 데이터(`{ seed: true }`)와 달리
	// 실제 수신 형태(파라미터 40여 개, 중복 키, 미치환 매크로)를 raw_query_params에 그대로 남긴다.
	// 파생 컬럼은 손으로 적지 않고 실제 파이프라인과 같은 경로(TRACKERS 매퍼 → createPostback)로 만들어 매퍼가 바뀌면 시드도 따라간다.
	// view_code를 sub_id로 갈라 두어(seed_sub_raw) 위 7일치의 "postback 건수 = daily_report 카운터" 정합을 건드리지 않는다.
	const sampleViewCode = viewCodeCodec.encode(`${campaign.token}:seed_pub:seed_sub_raw`);
	// 트래커는 URL 디코드된 값을 되돌려주고 매퍼가 다시 인코딩한다 — 쿼리에는 디코드된 형태를 넣는다
	const samples = buildPostbackSamples({ token: campaign.token, viewCode: decodeURIComponent(sampleViewCode), baseDate });
	for (const sample of samples) {
		const definition = TRACKERS[sample.tracker]!;
		// 중복 키를 배열로 넘기는 것은 express도 마찬가지다(타입만 string) — 실제 런타임과 같은 형태로 매퍼에 태운다
		const query = sample.query as Record<string, string>;
		// install 엔드포인트의 event_name은 트래커 값이 아니라 'install' 고정이다(InstallPostbackUseCase와 동일)
		const mapped = sample.kind === 'install' ? { ...definition.install(query), eventName: 'install' } : definition.event(query);
		const [, pubId, subId] = viewCodeCodec.decode(mapped.viewCode).split(':');
		postbacks.push(
			createPostback({
				...mapped,
				trackerName: sample.tracker,
				pubId: pubId || null,
				subId: subId || null,
				rawQueryParams: JSON.stringify(sample.query),
			})
		);
	}

	// 샘플에 대응하는 daily_report 한 줄. 이벤트 5건의 이름(abx:sign_up·03_NPSN·open·Platform_login·Complete_Registration)은
	// campaign_config에 없어 전부 미등록으로 잡히므로 install과 unregistered에만 반영된다.
	const sampleInstalls = samples.filter((sample) => sample.kind === 'install').length;
	const sampleCounters = { click: samples.length, install: sampleInstalls, registration: 0, purchase: 0, revenue: 0, unregistered: samples.length - sampleInstalls };
	await prisma.daily_report.upsert({
		where: { view_code_created_date: { view_code: sampleViewCode, created_date: baseDate } },
		update: sampleCounters,
		create: { view_code: sampleViewCode, token: campaign.token, pub_id: 'seed_pub', sub_id: 'seed_sub_raw', ...sampleCounters, created_date: baseDate },
	});

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
		`seed 완료: user 4개(admin=DEVELOPER / ops=ADMIN / viewer=USER · 카페 러시만 허용 / pending=미승인, 전부 @test.com · test1234!), advertiser·media, tracker ${trackers.length}개, advertising 2개·campaign 4개, daily_report 캠페인당 ${DAILY_REPORT_DAYS}일치, postback ${postbacks.length}건(트래커 원본 쿼리 샘플 ${samples.length}건 포함), reservation 2건`
	);
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
