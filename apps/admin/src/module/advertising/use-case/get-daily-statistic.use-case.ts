import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CAMPAIGN_REPOSITORY, DAILY_STATISTIC_REPOSITORY } from '@campaign/domain/symbol';
import { ICampaign, IDailyStatistic } from '@campaign/domain/repositories';
import { DailyStatistic } from '@advertising/dto/response';

@Injectable()
export class GetDailyStatisticUseCase {
	constructor(
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic
	) {}

	async execute(id: number, baseDate: Date) {
		const campaignList = await this.campaignRepository.findManyByAdvertisingId(id);
		const tokenList = campaignList.map((campaign) => campaign.token);
		const dailyStatisticList = await this.dailyStatisticRepository.findManyTokenList(tokenList, baseDate);

		return dailyStatisticList.map((dailyStatistic) => plainToInstance(DailyStatistic, dailyStatistic, { excludeExtraneousValues: true }));
	}
}
