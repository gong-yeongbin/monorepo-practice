import { Inject, Injectable } from '@nestjs/common';
import { base64 } from '@src/common/util/base64.util';
import { DAILY_STATISTIC_REPOSITORY } from '@tracking/domain/symbol';
import { IDailyStatistic } from '@tracking/domain/repositories';
import { plainToInstance } from 'class-transformer';
import { DailyStatisticDto } from '@tracking/dto';
import * as dayjs from 'dayjs';

@Injectable()
export class TrackingConsumerUseCase {
	constructor(@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: IDailyStatistic) {}

	async execute(viewCode: string) {
		const token = base64.decode(viewCode).split(':')[0] || null;
		const pubId = base64.decode(viewCode).split(':')[1] || null;
		const subId = base64.decode(viewCode).split(':')[2] || null;

		const dailyStatistic = plainToInstance(
			DailyStatisticDto,
			{ viewCode, token, pubId, subId, click: 1, createdAt: dayjs(dayjs().format('YYYY-MM-DD')).add(9, 'hour').toDate() },
			{ excludeExtraneousValues: true }
		);

		await this.dailyStatisticRepository.upsert(dailyStatistic);
	}
}
