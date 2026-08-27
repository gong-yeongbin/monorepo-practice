// PrismaDailyReportRepository의 배치 upsert SQL 실행·빈 배치 스킵·예외 전파를 검증
import { PrismaDailyReportRepository } from './prisma-daily-report.repository';
import { PrismaService } from '@infra/prisma/prisma.service';
import { DailyReport } from '@postback/domain/daily-report.entity';

const dailyReport = (overrides: Partial<DailyReport>) =>
	({
		view_code: 'vc-1',
		token: 'token-1',
		pub_id: 'pub-1',
		sub_id: 'sub-1',
		click: 0,
		install: 1,
		registration: 0,
		retention: 0,
		purchase: 0,
		revenue: 0,
		etc1: 0,
		etc2: 0,
		etc3: 0,
		etc4: 0,
		etc5: 0,
		unregistered: 0,
		created_date: new Date('2026-07-10T00:00:00.000Z'),
		...overrides,
	});

describe('PrismaDailyReportRepository (postback)', () => {
	const executeRaw = jest.fn();
	const prisma = { $executeRaw: executeRaw } as unknown as PrismaService;
	const repository = new PrismaDailyReportRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('빈 배치는 쿼리를 실행하지 않는다', async () => {
		await repository.upsertMany([]);

		expect(executeRaw).not.toHaveBeenCalled();
	});

	it('배치 전체를 ON CONFLICT DO UPDATE 한 문장으로 실행한다', async () => {
		executeRaw.mockResolvedValue(2);

		await repository.upsertMany([dailyReport({ view_code: 'vc-1', install: 2 }), dailyReport({ view_code: 'vc-2', purchase: 1, revenue: 1000 })]);

		expect(executeRaw).toHaveBeenCalledTimes(1);
		const query = executeRaw.mock.calls[0][0];
		expect(query.sql).toContain('INSERT INTO daily_report');
		expect(query.sql).toContain('ON CONFLICT (view_code, created_date) DO UPDATE SET');
		expect(query.sql).toContain('revenue = daily_report.revenue + EXCLUDED.revenue');
		expect(query.values).toContain('vc-1');
		expect(query.values).toContain('vc-2');
		// created_date는 타임존 변환을 피해 UTC 기준 날짜 문자열로 바인딩된다
		expect(query.values).toContain('2026-07-10');
	});

	it('쿼리 실패는 그대로 전파한다 (호출부에서 격리)', async () => {
		const error = new Error('db down');
		executeRaw.mockRejectedValue(error);

		await expect(repository.upsertMany([dailyReport({})])).rejects.toBe(error);
	});
});
