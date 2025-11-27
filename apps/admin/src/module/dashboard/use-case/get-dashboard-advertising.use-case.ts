import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/symbol';
import { DAILY_STATISTIC_REPOSITORY } from '@dashboard/domain/symbol';
import { ICampaign } from '@campaign/domain/repositories';
import { IDailyStatistic } from '@dashboard/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { ResponseAdvertisingDashboardDto } from '@dashboard/dto/response';

@Injectable()
export class GetDashboardAdvertisingUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic
	) {}

	async execute(baseDate: Date): Promise<ResponseAdvertisingDashboardDto[]> {
		const campaigns = await this.campaignRepository.findMany(baseDate);
		const advertigings = campaigns.reduce((acc, curr) => {
			if (!acc[curr.advertising_name]) acc[curr.advertising_name] = [];
			acc[curr.advertising_name].push(curr.token);
			return acc;
		}, {});

		return await Promise.all(
			Object.keys(advertigings).map(async (name) => {
				const sumDailyStatistic = await this.dailyStatisticRepository.findMany(advertigings[name], baseDate);
				return plainToInstance(ResponseAdvertisingDashboardDto, { name, ...sumDailyStatistic });
			})
		);
	}
}
