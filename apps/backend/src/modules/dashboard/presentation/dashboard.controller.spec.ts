// DashboardController가 각 라우트를 대응 use-case에 위임하고, payload에서 계산한 광고 스코프를 함께 넘기는지 검증
import { DashboardController } from './dashboard.controller';
import { DashboardUseCase } from '@dashboard/application/dashboard.use-case';
import { DailyUseCase } from '@dashboard/application/daily.use-case';
import { DailyDetailUseCase } from '@dashboard/application/daily-detail.use-case';
import { DetailUseCase } from '@dashboard/application/detail.use-case';
import { AccessTokenPayload } from '@auth/application/token.constants';

describe('DashboardController', () => {
	const dashboard = { execute: jest.fn() } as unknown as DashboardUseCase;
	const daily = { execute: jest.fn() } as unknown as DailyUseCase;
	const dailyDetail = { execute: jest.fn() } as unknown as DailyDetailUseCase;
	const detail = { execute: jest.fn() } as unknown as DetailUseCase;
	const controller = new DashboardController(dashboard, daily, dailyDetail, detail);

	const user: AccessTokenPayload = { sub: 1, email: 'viewer@test.com', role: 'USER', advertising_ids: [1] };
	const admin: AccessTokenPayload = { sub: 2, email: 'ops@test.com', role: 'ADMIN', advertising_ids: [] };

	beforeEach(() => jest.clearAllMocks());

	it('dashboard/daily는 query와 스코프를 위임한다', async () => {
		await controller.dashboard({ date: '2026-07-10' }, user);
		expect(dashboard.execute).toHaveBeenCalledWith({ date: '2026-07-10' }, [1]);

		const dailyQuery = { token: 't', start_date: '2026-07-01', end_date: '2026-07-10' };
		await controller.daily(dailyQuery, user);
		expect(daily.execute).toHaveBeenCalledWith(dailyQuery, [1]);
	});

	it('dailydetail은 query와 스코프를 위임한다', async () => {
		const query = { token: 't', start_date: '2026-07-01', end_date: '2026-07-10', type: 'install' as const, order: 'desc' as const };
		await controller.dailyDetail(query, user);
		expect(dailyDetail.execute).toHaveBeenCalledWith(query, [1]);
	});

	it('detail은 id·query와 스코프를 위임한다', async () => {
		const query = { start_date: '2026-07-01', end_date: '2026-07-10', media_id: 2 };
		(detail.execute as jest.Mock).mockResolvedValue([]);
		await controller.detail({ id: 1 }, query, user);
		expect(detail.execute).toHaveBeenCalledWith(1, query, [1]);
	});

	it('ADMIN은 스코핑 면제라 undefined를 넘긴다', async () => {
		await controller.dashboard({ date: '2026-07-10' }, admin);
		expect(dashboard.execute).toHaveBeenCalledWith({ date: '2026-07-10' }, undefined);
	});
});
