// AdvertisingController가 각 라우트를 대응 use-case에 위임하는지 검증
import { AdvertisingController } from './advertising.controller';
import { CreateAdvertisingUseCase } from '@advertising/application/create-advertising.use-case';
import { ListAdvertisingUseCase } from '@advertising/application/list-advertising.use-case';
import { BriefAdvertisingUseCase } from '@advertising/application/brief-advertising.use-case';
import { InfoAdvertisingUseCase } from '@advertising/application/info-advertising.use-case';
import { CampaignListUseCase } from '@advertising/application/campaign-list.use-case';
import { DeactivateAdvertisingUseCase } from '@advertising/application/deactivate-advertising.use-case';
import { DashboardUseCase } from '@advertising/application/dashboard.use-case';
import { DailyUseCase } from '@advertising/application/daily.use-case';
import { DetailUseCase } from '@advertising/application/detail.use-case';
import { DailyDetailUseCase } from '@advertising/application/daily-detail.use-case';
import { DailyDetailAllUseCase } from '@advertising/application/daily-detail-all.use-case';

describe('AdvertisingController', () => {
	const create = { execute: jest.fn() } as unknown as CreateAdvertisingUseCase;
	const list = { execute: jest.fn() } as unknown as ListAdvertisingUseCase;
	const brief = { execute: jest.fn() } as unknown as BriefAdvertisingUseCase;
	const info = { execute: jest.fn() } as unknown as InfoAdvertisingUseCase;
	const campaignList = { execute: jest.fn() } as unknown as CampaignListUseCase;
	const deactivate = { execute: jest.fn() } as unknown as DeactivateAdvertisingUseCase;
	const dashboard = { execute: jest.fn() } as unknown as DashboardUseCase;
	const daily = { execute: jest.fn() } as unknown as DailyUseCase;
	const detail = { execute: jest.fn() } as unknown as DetailUseCase;
	const dailyDetail = { execute: jest.fn() } as unknown as DailyDetailUseCase;
	const dailyDetailAll = { execute: jest.fn() } as unknown as DailyDetailAllUseCase;
	const controller = new AdvertisingController(create, list, brief, info, campaignList, deactivate, dashboard, daily, detail, dailyDetail, dailyDetailAll);

	beforeEach(() => jest.clearAllMocks());

	it('create는 생성 use-case에 body를 위임한다', async () => {
		const body = { name: 'ad', advertiser_id: 1, tracker_id: 2 };
		(create.execute as jest.Mock).mockResolvedValue({ id: 5 });
		expect(await controller.create(body)).toEqual({ id: 5 });
		expect(create.execute).toHaveBeenCalledWith(body);
	});

	it('list는 목록 use-case에 query를 위임한다', async () => {
		const query = { search: 'a', offset: 0, limit: 20 };
		(list.execute as jest.Mock).mockResolvedValue([]);
		await controller.list(query);
		expect(list.execute).toHaveBeenCalledWith(query);
	});

	it('brief는 간략 목록 use-case를 호출한다', async () => {
		(brief.execute as jest.Mock).mockResolvedValue([]);
		await controller.brief();
		expect(brief.execute).toHaveBeenCalled();
	});

	it('info는 조회 use-case에 id를 위임한다', async () => {
		(info.execute as jest.Mock).mockResolvedValue({});
		await controller.info({ id: 1 });
		expect(info.execute).toHaveBeenCalledWith(1);
	});

	it('campaignList는 use-case에 id를 위임한다', async () => {
		(campaignList.execute as jest.Mock).mockResolvedValue([]);
		await controller.campaignList({ id: 1 });
		expect(campaignList.execute).toHaveBeenCalledWith(1);
	});

	it('deactivate는 use-case에 id를 위임한다', async () => {
		await controller.deactivate({ id: 1 });
		expect(deactivate.execute).toHaveBeenCalledWith(1);
	});

	it('dashboard/daily/dailyDetail/dailyDetailExcel는 query를 위임한다', async () => {
		await controller.dashboard({ date: '2026-07-10' });
		expect(dashboard.execute).toHaveBeenCalledWith({ date: '2026-07-10' });

		const dailyQuery = { token: 't', start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.daily(dailyQuery);
		expect(daily.execute).toHaveBeenCalledWith(dailyQuery);

		await controller.dailyDetail(dailyQuery);
		expect(dailyDetail.execute).toHaveBeenCalledWith(dailyQuery);

		const allQuery = { start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.dailyDetailExcel(allQuery);
		expect(dailyDetailAll.execute).toHaveBeenCalledWith(allQuery);
	});

	it('detail은 id와 query를 위임한다', async () => {
		const query = { start_date: '2026-07-01', end_date: '2026-07-10', media_id: 2 };
		(detail.execute as jest.Mock).mockResolvedValue([]);
		await controller.detail({ id: 1 }, query);
		expect(detail.execute).toHaveBeenCalledWith(1, query);
	});
});
