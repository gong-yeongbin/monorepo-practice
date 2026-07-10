// PrismaDailyReportRepository의 upsert 정상·P2002 재시도·기타 예외 전파를 검증
import { Prisma } from '@prisma/client';
import { PrismaDailyReportRepository } from './prisma-daily-report.repository';
import { PrismaService } from '@infra/prisma/prisma.service';
import { DailyReport } from '@tracking/domain/daily-report.entity';

const dailyReport = {
	view_code: 'vc-1',
	token: 'token-1',
	pub_id: 'pub-1',
	sub_id: 'sub-1',
	click: 1,
	install: 0,
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
} as DailyReport;

describe('PrismaDailyReportRepository (tracking)', () => {
	const upsert = jest.fn();
	const prisma = { daily_report: { upsert } } as unknown as PrismaService;
	const repository = new PrismaDailyReportRepository(prisma);

	beforeEach(() => jest.clearAllMocks());

	it('정상적으로 upsert를 한 번 호출한다', async () => {
		upsert.mockResolvedValue(undefined);

		await repository.upsert(dailyReport);

		expect(upsert).toHaveBeenCalledTimes(1);
		expect(upsert.mock.calls[0][0].where).toEqual({ view_code_created_date: { view_code: 'vc-1', created_date: dailyReport.created_date } });
		expect(upsert.mock.calls[0][0].update.click).toEqual({ increment: 1 });
	});

	it('P2002 유니크 충돌이면 한 번 재시도한다', async () => {
		const p2002 = new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 'test' });
		upsert.mockRejectedValueOnce(p2002).mockResolvedValueOnce(undefined);

		await repository.upsert(dailyReport);

		expect(upsert).toHaveBeenCalledTimes(2);
	});

	it('P2002가 아닌 예외는 재시도 없이 전파한다', async () => {
		const other = new Prisma.PrismaClientKnownRequestError('fk', { code: 'P2003', clientVersion: 'test' });
		upsert.mockRejectedValue(other);

		await expect(repository.upsert(dailyReport)).rejects.toBe(other);
		expect(upsert).toHaveBeenCalledTimes(1);
	});
});
