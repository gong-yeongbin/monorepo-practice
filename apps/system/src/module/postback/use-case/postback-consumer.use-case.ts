import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PostbackDto } from '@postback/dto';
import { POSTBACK_REPOSITORY } from '@postback/domain/symbol';
import { IPostback } from '@postback/domain/repositories';
import { CAMPAIGN_REPOSITORY, DAILY_STATISTIC_REPOSITORY } from '@tracking/domain/symbol';
import { ICampaign, IDailyStatistic } from '@tracking/domain/repositories';
import * as dayjs from 'dayjs';
import { DailyStatisticDto } from '@tracking/dto';

@Injectable()
export class PostbackConsumerUseCase {
	constructor(
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepositroy: IPostback,
		@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaign,
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic
	) {}

	async execute(message: string) {
		const baseDate = dayjs(dayjs().format('YYYY-MM-DD')).add(9, 'hour').toDate();
		const postback = plainToInstance(PostbackDto, message, { ignoreDecorators: true, enableImplicitConversion: true });
		const campaign = await this.campaignRepository.findByToken(postback.token);
		const dailyStatistic = await this.dailyStatisticRepository.find(postback.view_code, baseDate);

		let dailyStatisticDto: DailyStatisticDto;
		if (dailyStatistic) {
			dailyStatisticDto = plainToInstance(DailyStatisticDto, dailyStatistic, { ignoreDecorators: true });
		} else {
			dailyStatisticDto = plainToInstance(
				DailyStatisticDto,
				{ view_code: postback.view_code, token: postback.token, pub_id: postback.pub_id, sub_id: postback.sub_id, created_at: baseDate },
				{ exposeDefaultValues: true }
			);
		}

		const event = campaign?.campaign_config.find((campaignConfig) => campaignConfig.tracker_event_name === postback.event_name);
		switch (event?.admin_event_name) {
			case 'install':
				dailyStatisticDto.install += 1;
				break;
			case 'registration':
				dailyStatisticDto.registration += 1;
				break;
			case 'retention':
				dailyStatisticDto.retention += 1;
				break;
			case 'purchase':
				dailyStatisticDto.purchase += 1;
				dailyStatisticDto.revenue += postback?.revenue ? parseInt(postback?.revenue) : 0;
				break;
			case 'etc1':
				dailyStatisticDto.etc1 += 1;
				break;
			case 'etc2':
				dailyStatisticDto.etc2 += 1;
				break;
			case 'etc3':
				dailyStatisticDto.etc3 += 1;
				break;
			case 'etc4':
				dailyStatisticDto.etc4 += 1;
				break;
			case 'etc5':
				dailyStatisticDto.etc5 += 1;
				break;
			default:
				dailyStatisticDto.unregistered += 1;
				break;
		}

		await this.postbackRepositroy.create(postback);
		await this.dailyStatisticRepository.upsert(dailyStatisticDto);
	}
}
