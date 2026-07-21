import { rest } from 'msw';

const baseURL = import.meta.env.VITE_API_URL;

export const handlers = [
	rest.post(`${baseURL}/login`, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				data: {
					accessToken: 'fakeAccessToken',
				},
			}),
		);
	}),

	rest.get(`${baseURL}/advertising/dashboard`, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				data: [
					{
						idx: '46',
						name: '티몬_CPA (AOS)',
						platform: 'AOS',
						click: '1792039',
						install: '60',
						registration: '0',
						retention: '0',
						purchase: '1',
						revenue: '29600',
						etc1: '0',
						etc2: '0',
						etc3: '0',
						etc4: '0',
						etc5: '0',
					},
					{
						idx: '57',
						name: '그린카 (AOS)',
						platform: 'AOS',
						click: '6058020',
						install: '518',
						registration: '38',
						retention: '0',
						purchase: '9',
						revenue: '393270',
						etc1: '0',
						etc2: '0',
						etc3: '0',
						etc4: '0',
						etc5: '0',
					},
				],
			}),
		);
	}),

	rest.get(`${baseURL}/profile`, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				data: {
					idx: '1',
					id: 'dev',
					password: '$2a$08$Jlv2kWB2gtL6uhhgk8njZuherTjdpy6qRJ.VunjKc5jw5pts/xzdG',
					type: 'dev',
					createdAt: '2021-06-13T22:01:37.681Z',
					updatedAt: '2022-02-22T01:52:45.665Z',
					typeIdx: 0,
				},
			}),
		);
	}),

	// Selectbar(Home)
	rest.get(`${baseURL}/advertising/list`, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				data: [
					{
						idx: '43',
						name: '티몬 (AOS)',
						platform: 'AOS',
						imageUrl: 'https://dj6dzqzknb2sj.cloudfront.net/advertising/43/image',
						tracker: 'singular',
					},
					{
						idx: '44',
						name: '티몬 (iOS)',
						platform: 'iOS',
						imageUrl: 'https://dj6dzqzknb2sj.cloudfront.net/advertising/44/image',
						tracker: 'singular',
					},
					{
						idx: '48',
						name: '탈잉 (AOS)',
						platform: 'AOS',
						imageUrl: 'https://dj6dzqzknb2sj.cloudfront.net/advertising/48/image',
						tracker: 'appsflyer',
					},
					{
						idx: '49',
						name: '탈잉 (iOS)',
						platform: 'iOS',
						imageUrl: 'https://dj6dzqzknb2sj.cloudfront.net/advertising/49/image',
						tracker: 'appsflyer',
					},
				],
			}),
		);
	}),

	// Advertising List
	rest.get(`${baseURL}/advertising`, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				data: [
					{
						idx: '78',
						name: '반려의고수_구매 (AOS)',
						platform: 'AOS',
						imageUrl: 'https://dj6dzqzknb2sj.cloudfront.net/advertising/78/image',
						status: 1,
						createdAt: '2022-06-10T04:53:42.068Z',
						updatedAt: '2022-06-10T04:53:42.181Z',
						campaign: 3,
					},
					{
						idx: '74',
						name: '카트라이더 러쉬플러스 (AOS)',
						platform: 'AOS',
						imageUrl: 'https://dj6dzqzknb2sj.cloudfront.net/advertising/74/image',
						status: 1,
						createdAt: '2022-06-08T06:38:17.476Z',
						updatedAt: '2022-06-08T06:38:17.614Z',
						campaign: 5,
					},
				],
				_meta: {
					search: '',
					status: '1',
					offset: '0',
					limit: '100',
				},
			}),
		);
	}),

	// InfoCard
	rest.get(`${baseURL}/advertising/:id`, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				data: {
					advertiser: '플레이디',
					tracker: 'airbridge',
					advertising: '반려의고수_구매 (AOS)',
					platform: 'AOS',
					advertisingImageUrl: 'https://dj6dzqzknb2sj.cloudfront.net/advertising/78/image',
					media: ['paddlewaver', 'mobpeas', 'vikingmedia'],
				},
			}),
		);
	}),

	// InfoCard (Second)
	rest.get(`${baseURL}/campaign/:id`, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				data: {
					idx: '333',
					token: 'c3c52ae868d44c27b385e685ead6cf3c',
					appkey: '@vango',
					name: '반려의고수_구매_0613',
					type: 'CPA',
					trackerTrackingStatus: 0,
					mecrossTrackingStatus: 0,
					status: 1,
					trackerTrackingUrl:
						'https://abr.ge/@vango/mecrosspro?click_id={click_id}&sub_id={publisher_id}&sub_id_1={sub_id_1}&gaid_raw={gaid}&ifa_raw={idfa}&custom_param1={custom_param1}&custom_param2={custom_param2}&custom_param3={custom_param3}&custom_param4={custom_param4}&custom_param5={custom_param5}&campaign=kensington_2206&ad_group={ad_group}&ad_creative={ad_creative}&tracking_template_id=7a6b5cf45e08ea96a7af12710d763a72&routing_short_id=x7zkut&ad_type=click',
					mecrossTrackingUrl:
						'http://api.mecrosspro.com/tracking?token=c3c52ae868d44c27b385e685ead6cf3c&click_id={click_id}&pub_id={pub_id}&sub_id={sub_id}&idfa={idfa}&adid={adid}',
					block: 0,
					updatedAt: '2022-06-13T06:00:04.877Z',
					createdAt: '2022-06-13T06:00:04.877Z',
				},
			}),
		);
	}),

	// Campaign List
	rest.get(`${baseURL}/advertising/campaign/:id`, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				data: [
					{
						campaignIdx: '333',
						token: 'c3c52ae868d44c27b385e685ead6cf3c',
						campaignName: '반려의고수_구매_0613',
						campaignType: 'CPA',
						campaignStatus: 1,
						campaignBlock: 0,
						mediaName: 'vikingmedia',
					},
					{
						campaignIdx: '329',
						token: '685515d281c94255b816927e591e0f20',
						campaignName: '반려의고수_구매_0610',
						campaignType: 'CPA',
						campaignStatus: 1,
						campaignBlock: 0,
						mediaName: 'mobpeas',
					},
					{
						campaignIdx: '325',
						token: 'af6a5b9e225340d987678b719ed2f83a',
						campaignName: '반려의고수_구매_0610',
						campaignType: 'CPA',
						campaignStatus: 1,
						campaignBlock: 0,
						mediaName: 'paddlewaver',
					},
				],
			}),
		);
	}),

	// Campaign Events
	rest.get(`${baseURL}/campaign/:id/event`, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				data: [
					{
						tracker: 'install',
						admin: 'install',
						media: 'install',
						status: 1,
					},
				],
			}),
		);
	}),
];
