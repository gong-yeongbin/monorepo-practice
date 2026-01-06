import { Inject, Injectable } from '@nestjs/common';
import { DAILY_STATISTIC_REPOSITORY } from '@campaign/domain/symbol';
import { IDailyStatistic } from '@campaign/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { DailyStatistic } from '@campaign/dto/response';

@Injectable()
export class GetDailyStatisticsUseCase {
	constructor(@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic) {}

	async execute(token: string, startDate: Date, endDate: Date) {
		const dailyStatistics = await this.dailyStatisticRepository.findMany(token, startDate, endDate);
		return dailyStatistics.map((dailyStatistic) => plainToInstance(DailyStatistic, dailyStatistic, { excludeExtraneousValues: true }));
	}
}
