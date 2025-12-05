import { Inject, Injectable } from '@nestjs/common';
import { DAILY_STATISTIC_REPOSITORY } from '@dashboard/domain/symbol';
import { IDailyStatistic } from '@dashboard/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { ResponseMediaDetailDashboardDto } from '@dashboard/dto/response';

@Injectable()
export class DashboardMediaDetailUseCase {
	constructor(@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic) {}

	async execute(token: string, startDate: Date, endDate: Date) {
		const dashboardMediaDetail = await this.dailyStatisticRepository.dashboardMediaDetail(token, startDate, endDate);

		return dashboardMediaDetail?.map((media) => plainToInstance(ResponseMediaDetailDashboardDto, media, { excludeExtraneousValues: true }));
	}
}
