import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/symbol';
import { DAILY_STATISTIC_REPOSITORY } from '@dashboard/domain/symbol';
import { ICampaign } from '@campaign/domain/repositories';
import { IDailyStatistic } from '@dashboard/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { ResponseAdvertisingDashboardDto } from '@dashboard/dto/response';

@Injectable()
export class GetStatisticByCampaignUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic
	) {}

	async execute(advertisingName: string, startDate: Date, endDate: Date) {
		const campaignList = await this.campaignRepository.findManyByAdvertising(advertisingName);
		const mediaList = campaignList.reduce<Record<string, string[]>>((acc, curr) => {
			if (!acc[curr.media_name]) acc[curr.media_name] = [];
			acc[curr.media_name].push(curr.token);
			return acc;
		}, {});

		const response = await Promise.all(
			Object.keys(mediaList).map(async (name) => {
				const sumDailyStatistic = await this.dailyStatisticRepository.findManyByCampaign(mediaList[name], startDate, endDate);
				if (sumDailyStatistic) return plainToInstance(ResponseAdvertisingDashboardDto, { name, ...sumDailyStatistic });
			})
		);

		return response.filter((res) => res !== undefined);
	}
}
