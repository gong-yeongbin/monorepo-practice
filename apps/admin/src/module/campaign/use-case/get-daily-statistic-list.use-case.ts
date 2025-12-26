import { Inject, Injectable } from '@nestjs/common';
import { DAILY_STATISTIC_REPOSITORY } from '@campaign/domain/symbol';
import { IDailyStatistic } from '@campaign/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { DailyStatistic } from '@campaign/dto/response';
import { GetDailyStatisticInput } from '@campaign/dto/request';

@Injectable()
export class GetDailyStatisticListUseCase {
	constructor(@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic) {}

	async execute(token: string, input: GetDailyStatisticInput) {
		const { startDate, endDate } = input;

		const dailyStatisticList = await this.dailyStatisticRepository.findMany(token, startDate, endDate);
		return dailyStatisticList.map((dailyStatistic) => plainToInstance(DailyStatistic, dailyStatistic, { excludeExtraneousValues: true }));
	}
}
