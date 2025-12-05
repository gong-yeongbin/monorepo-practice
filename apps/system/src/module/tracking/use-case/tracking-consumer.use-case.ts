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
		await this.consumer.registerBatch('tracking', async ({ batch, resolveOffset, heartbeat }) => {
			const dailyStatisticMap = new Map<string, DailyStatisticDto>();
			for (const message of batch.messages) {
				if (message.value?.toString()) {
					const baseDate = dayjs(dayjs().format('YYYY-MM-DD')).add(9, 'hour').toDate();
					const viewCode = message.value.toString();

					const token = base64.decode(viewCode).split(':')[0] || null;
					const pubId = base64.decode(viewCode).split(':')[1] || null;
					const subId = base64.decode(viewCode).split(':')[2] || null;

					let dailyStatisticDto = dailyStatisticMap.get(viewCode);
					if (dailyStatisticDto) {
						dailyStatisticDto.click += 1;
					} else {
						dailyStatisticDto = plainToInstance(
							DailyStatisticDto,
							{ view_code: viewCode, token: token, pub_id: pubId, sub_id: subId, click: 1, created_date: baseDate },
							{ exposeDefaultValues: true }
						);

						dailyStatisticMap.set(viewCode, dailyStatisticDto);
					}
				}
				resolveOffset(message.offset);
				await heartbeat();
			}

			await Promise.all([...dailyStatisticMap.values()].map(async (dailyStatistic) => await this.dailyStatisticRepository.upsert(dailyStatistic)));
			dailyStatisticMap.clear();
		});
	}
}
