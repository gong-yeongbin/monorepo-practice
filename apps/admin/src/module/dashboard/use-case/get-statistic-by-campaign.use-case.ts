import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/symbol';
import { DAILY_STATISTIC_REPOSITORY } from '@dashboard/domain/symbol';
import { ICampaign } from '@campaign/domain/repositories';
import { IDailyStatistic } from '@dashboard/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { ResponseCampaignDashboardDto } from '@dashboard/dto/response';

@Injectable()
export class GetStatisticByCampaignUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic
	) {}

	async execute(advertisingName: string, startDate: Date, endDate: Date) {
		const campaignList = await this.campaignRepository.findManyByAdvertising(advertisingName);

		const response = await Promise.all(
			campaignList.map(async (campaign) => {
				const sumDailyStatistic = await this.dailyStatisticRepository.findManyByCampaign(campaign.token, startDate, endDate);
				if (sumDailyStatistic) return plainToInstance(ResponseCampaignDashboardDto, { ...campaign, ...sumDailyStatistic }, { excludeExtraneousValues: true });
			})
		);

		return response.filter((res) => res !== undefined);
	}
}
