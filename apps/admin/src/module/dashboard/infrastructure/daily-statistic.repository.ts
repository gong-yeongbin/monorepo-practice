import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IDailyStatistic } from '@dashboard/domain/repositories';
import { PrismaService } from '@repo/prisma';
import { DailyStatistic, DashboardAdvertising, DashboardCampaign, DashboardMedia } from '@dashboard/domain/entities';

@Injectable()
export class DailyStatisticRepository implements IDailyStatistic {
	constructor(private readonly prismaService: PrismaService) {}

	async dashboardAdvertising(tokens: string[], baseDate: Date): Promise<DashboardAdvertising | null> {
		try {
			const result = await this.prismaService.daily_statistic.aggregate({
				where: { token: { in: tokens }, created_date: baseDate },
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

	async dashboardCampaign(token: string, startDate: Date, endDate: Date): Promise<DashboardCampaign | null> {
		try {
			const aggregate = await this.prismaService.daily_statistic.aggregate({
				where: { token, created_date: { gte: startDate, lte: endDate } },
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
			return aggregate._sum.click !== null ? aggregate._sum : null;
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async dashboardMedia(token: string, startDate: Date, endDate: Date): Promise<DashboardMedia[]> {
		try {
			const groupby = await this.prismaService.daily_statistic.groupBy({
				by: ['created_date'],
				where: { token, created_date: { gte: startDate, lte: endDate } },
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

			return groupby.map((group) => {
				return { ...group._sum, createdDate: group.created_date };
			});
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async dashboardMediaDetail(token: string, startDate: Date, endDate: Date): Promise<DailyStatistic[] | null> {
		try {
			return await this.prismaService.daily_statistic.findMany({ where: { token, created_date: { gte: startDate, lte: endDate } } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
