import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IDailyStatistic } from '@campaign/domain/repositories';
import { PrismaService } from '@repo/prisma';
import { DailyStatistic } from '../domain/entities';

@Injectable()
export class DailyStatisticRepository implements IDailyStatistic {
	constructor(private readonly prismaService: PrismaService) {}

	async findMany(token: string, startDate: Date, endDate: Date): Promise<DailyStatistic[]> {
		try {
			return await this.prismaService.daily_statistic.findMany({ where: { token, created_date: { gte: startDate, lte: endDate } } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
