import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@repo/prisma';
import { DailyStatistic } from '@campaign/domain/daily-statistic.entity';
import { DailyStatisticRepository } from '@campaign/domain/daily-statistic.repository';

@Injectable()
export class PrismaDailyStatisticRepository implements DailyStatisticRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async upsert(dailyStatistic: DailyStatistic): Promise<void> {
		try {
			await this.doUpsert(dailyStatistic);
		} catch (e) {
			// 동시 upsert 레이스로 create 경로가 unique 제약(P2002)에 걸리면 한 번 재시도한다 (재시도는 update 경로를 탄다)
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				await this.doUpsert(dailyStatistic);
			} else {
				throw e;
			}
		}
	}

	private async doUpsert(dailyStatistic: DailyStatistic): Promise<void> {
		const { view_code, token, pub_id, sub_id, click, install, registration, retention, purchase, revenue, etc1, etc2, etc3, etc4, etc5, unregistered, created_date } =
			dailyStatistic;

		await this.prismaService.daily_statistic.upsert({
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
