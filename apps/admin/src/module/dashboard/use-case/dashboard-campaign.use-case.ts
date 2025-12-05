import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/symbol';
import { DAILY_STATISTIC_REPOSITORY } from '@dashboard/domain/symbol';
import { ICampaign } from '@campaign/domain/repositories';
import { IDailyStatistic } from '@dashboard/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { ResponseCampaignDashboardDto } from '@dashboard/dto/response';

@Injectable()
export class DashboardCampaignUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic
	) {}

	async execute(name: string, startDate: Date, endDate: Date) {
		const campaignList = await this.campaignRepository.advertising(name);

		const response = await Promise.all(
			campaignList.map(async (campaign) => {
				const dashboardCampaign = await this.dailyStatisticRepository.dashboardCampaign(campaign.token, startDate, endDate);
				if (dashboardCampaign) return plainToInstance(ResponseCampaignDashboardDto, { ...campaign, ...dashboardCampaign }, { excludeExtraneousValues: true });
			})
		);

		return response.filter((res) => res !== undefined);
	}
}
