import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { base64 } from '@src/common/util/base64.util';
import { DAILY_STATISTIC_REPOSITORY } from '@tracking/domain/symbol';
import { IDailyStatistic } from '@tracking/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { DailyStatisticDto } from '@tracking/dto';
import * as dayjs from 'dayjs';
import { CONSUMER } from '@core/kafka/symbol';
import { IConsumer } from '@core/kafka/interface';

@Injectable()
export class TrackingConsumerUseCase implements OnModuleInit {
	constructor(
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic,
		@Inject(CONSUMER) private readonly consumer: IConsumer
	) {}

	async onModuleInit() {
		await this.consumer.each('tracking', async ({ message }) => {
			if (message.value?.toString()) {
				const baseDate = dayjs(dayjs().format('YYYY-MM-DD')).add(9, 'hour').toDate();
				const viewCode = message.value.toString();

				const token = base64.decode(viewCode).split(':')[0] || null;
				const pubId = base64.decode(viewCode).split(':')[1] || null;
				const subId = base64.decode(viewCode).split(':')[2] || null;

				const dailyStatistic = await this.dailyStatisticRepository.find(viewCode, baseDate);

				let dailyStatisticDto: DailyStatisticDto;
				if (dailyStatistic) {
					dailyStatisticDto = plainToInstance(DailyStatisticDto, dailyStatistic, { ignoreDecorators: true });
				} else {
					dailyStatisticDto = plainToInstance(
						DailyStatisticDto,
						{ view_code: viewCode, token: token, pub_id: pubId, sub_id: subId, created_at: baseDate },
						{ exposeDefaultValues: true }
					);
				}

				dailyStatisticDto.click += 1;
				await this.dailyStatisticRepository.upsert(dailyStatisticDto);
			}
		});
	}
}
