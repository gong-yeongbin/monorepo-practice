import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IDailyStatistic } from '@tracking/domain/repositories';
import { PrismaService } from '@repo/prisma';
import { DailyStatisticDto } from '../dto';
import { DailyStatistic } from '../domain/entities';

@Injectable()
export class DailyStatisticRepository implements IDailyStatistic {
	constructor(private readonly prismaService: PrismaService) {}

	async find(viewCode: string, baseDate: Date): Promise<DailyStatistic | null> {
		try {
			return await this.prismaService.daily_statistic.findUnique({ where: { view_code_created_at: { view_code: viewCode, created_at: baseDate } } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async upsert(dailyStatistic: DailyStatisticDto): Promise<void> {
		try {
			const { view_code, token, pub_id, sub_id, click, install, registration, retention, purchase, revenue, etc1, etc2, etc3, etc4, etc5, unregistered, created_at } =
				dailyStatistic;
			await this.prismaService.daily_statistic.upsert({
				where: { view_code_created_at: { view_code, created_at } },
				create: { view_code, token, pub_id, sub_id, click, install, registration, retention, purchase, revenue, etc1, etc2, etc3, etc4, etc5, unregistered, created_at },
				update: { click, install, registration, retention, purchase, revenue, etc1, etc2, etc3, etc4, etc5, unregistered },
			});
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
