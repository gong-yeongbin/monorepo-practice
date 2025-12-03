import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IDailyStatistic } from '@dashboard/domain/repositories';
import { PrismaService } from '@repo/prisma';
import { SumDailyStatistic } from '@dashboard/dto/sum-daily-statistic.dto';

@Injectable()
export class DailyStatisticRepository implements IDailyStatistic {
	constructor(private readonly prismaService: PrismaService) {}

	async findManyByAdvertising(tokens: string[], baseDate: Date): Promise<SumDailyStatistic | null> {
		try {
			const result = await this.prismaService.daily_statistic.aggregate({
				where: { token: { in: tokens }, created_at: baseDate },
				_sum: {
					click: true,
					install: true,
					registration: true,
					retention: true,
					purchase: true,
					revenue: true,
					etc1: true,
					etc2: true,
					etc3: true,
					etc4: true,
					etc5: true,
					unregistered: true,
				},
			});
			return result._sum.click !== null ? result._sum : null;
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findManyByCampaign(tokens: string[], startDate: Date, endDate: Date): Promise<SumDailyStatistic | null> {
		try {
			const result = await this.prismaService.daily_statistic.aggregate({
				where: { token: { in: tokens }, created_at: { gte: startDate, lte: endDate } },
				_sum: {
					click: true,
					install: true,
					registration: true,
					retention: true,
					purchase: true,
					revenue: true,
					etc1: true,
					etc2: true,
					etc3: true,
					etc4: true,
					etc5: true,
					unregistered: true,
				},
			});
			return result._sum.click !== null ? result._sum : null;
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
