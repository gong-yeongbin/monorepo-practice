// Prisma로 일별 리포트를 upsert하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/prisma.service';
import { DailyReport } from '@postback/domain/daily-report.entity';
import { DailyReportRepository } from '@postback/domain/daily-report.repository';

@Injectable()
export class PrismaDailyReportRepository implements DailyReportRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async upsert(dailyReport: DailyReport): Promise<void> {
		try {
			await this.doUpsert(dailyReport);
		} catch (e) {
			// 동시 upsert 레이스로 create 경로가 unique 제약(P2002)에 걸리면 한 번 재시도한다 (재시도는 update 경로를 탄다)
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				await this.doUpsert(dailyReport);
			} else {
				throw e;
			}
		}
	}

	private async doUpsert(dailyReport: DailyReport): Promise<void> {
		const { view_code, token, pub_id, sub_id, click, install, registration, retention, purchase, revenue, etc1, etc2, etc3, etc4, etc5, unregistered, created_date } =
			dailyReport;

		await this.prismaService.daily_report.upsert({
			where: { view_code_created_date: { view_code, created_date } },
			create: { view_code, token, pub_id, sub_id, click, install, registration, retention, purchase, revenue, etc1, etc2, etc3, etc4, etc5, unregistered, created_date },
			update: {
				click: { increment: click },
				install: { increment: install },
				registration: { increment: registration },
				retention: { increment: retention },
				purchase: { increment: purchase },
				revenue: { increment: revenue },
				etc1: { increment: etc1 },
				etc2: { increment: etc2 },
				etc3: { increment: etc3 },
				etc4: { increment: etc4 },
				etc5: { increment: etc5 },
				unregistered: { increment: unregistered },
			},
		});
	}
}
