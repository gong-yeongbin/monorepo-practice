// DashboardController가 각 라우트를 대응 use-case에 위임하는지 검증
import { DashboardController } from './dashboard.controller';
import { DashboardUseCase } from '@dashboard/application/dashboard.use-case';
import { DailyUseCase } from '@dashboard/application/daily.use-case';
import { DetailUseCase } from '@dashboard/application/detail.use-case';
import { DailyDetailUseCase } from '@dashboard/application/daily-detail.use-case';
import { DailyDetailAllUseCase } from '@dashboard/application/daily-detail-all.use-case';

describe('DashboardController', () => {
	const dashboard = { execute: jest.fn() } as unknown as DashboardUseCase;
	const daily = { execute: jest.fn() } as unknown as DailyUseCase;
	const detail = { execute: jest.fn() } as unknown as DetailUseCase;
	const dailyDetail = { execute: jest.fn() } as unknown as DailyDetailUseCase;
	const dailyDetailAll = { execute: jest.fn() } as unknown as DailyDetailAllUseCase;
	const controller = new DashboardController(dashboard, daily, detail, dailyDetail, dailyDetailAll);

	beforeEach(() => jest.clearAllMocks());

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
