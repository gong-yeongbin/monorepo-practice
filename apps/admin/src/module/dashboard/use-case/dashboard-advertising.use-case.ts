import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/symbol';
import { DAILY_STATISTIC_REPOSITORY } from '@dashboard/domain/symbol';
import { ICampaign } from '@campaign/domain/repositories';
import { IDailyStatistic } from '@dashboard/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { ResponseAdvertisingDashboardDto } from '@dashboard/dto/response';

@Injectable()
export class DashboardAdvertisingUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic
	) {}

	async execute(baseDate: Date): Promise<ResponseAdvertisingDashboardDto[]> {
		const campaignList = await this.campaignRepository.findMany();
		const advertigingList = campaignList.reduce((acc, curr) => {
			if (!acc[curr.advertising_name]) acc[curr.advertising_name] = [];
			acc[curr.advertising_name].push(curr.token);
			return acc;
		}, {});

		const response = await Promise.all(
			Object.keys(advertigingList).map(async (name) => {
				const dashboardAdvertising = await this.dailyStatisticRepository.dashboardAdvertising(advertigingList[name], baseDate);
				if (dashboardAdvertising) return plainToInstance(ResponseAdvertisingDashboardDto, { name, ...dashboardAdvertising });
			})
		);

		return response.filter((res) => res !== undefined);
	}
}
