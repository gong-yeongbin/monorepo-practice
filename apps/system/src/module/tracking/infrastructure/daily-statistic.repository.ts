import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IDailyStatistic } from '@tracking/domain/repositories';
import { PrismaService } from '@repo/prisma';
import { DailyStatisticDto } from '../dto';

@Injectable()
export class DailyStatisticRepository implements IDailyStatistic {
	constructor(private readonly prismaService: PrismaService) {}

	async upsert(dailyStatistic: DailyStatisticDto): Promise<void> {
		try {
			const { view_code, token, pub_id, sub_id, click, created_at } = dailyStatistic;
			await this.prismaService.daily_statistic.upsert({
				where: { view_code_created_at: { view_code: dailyStatistic.view_code, created_at: dailyStatistic.created_at } },
				create: { view_code, token, pub_id, sub_id, created_at, click },
				update: { click: { increment: 1 } },
			});
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
