import { Inject, Injectable } from '@nestjs/common';
import { DAILY_STATISTIC_REPOSITORY } from '@dashboard/domain/symbol';
import { IDailyStatistic } from '@dashboard/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { ResponseMediaDashboardDto } from '@dashboard/dto/response';

@Injectable()
export class DashboardMediaUseCase {
	constructor(@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic) {}

	async execute(token: string, startDate: Date, endDate: Date) {
		const dashboardMedia = await this.dailyStatisticRepository.dashboardMedia(token, startDate, endDate);

		return dashboardMedia?.map((media) => plainToInstance(ResponseMediaDashboardDto, { ...media, token }, { excludeExtraneousValues: true }));
	}
}
