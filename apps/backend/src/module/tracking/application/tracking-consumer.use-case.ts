import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DAILY_STATISTIC_REPOSITORY, DailyStatisticRepository } from '@campaign/domain/daily-statistic.repository';
import { DailyStatistic } from '@campaign/domain/daily-statistic.entity';
import { CONSUMER_PORT, ConsumerPort } from '@core/kafka/consumer.port';
import { base64 } from '@src/common/util/base64.util';
import { kstBaseDate } from '@src/common/util/date.util';

@Injectable()
export class TrackingConsumerUseCase implements OnModuleInit {
	private readonly logger = new Logger(TrackingConsumerUseCase.name);

	constructor(
		@Inject(DAILY_STATISTIC_REPOSITORY) private readonly dailyStatisticRepository: DailyStatisticRepository,
		@Inject(CONSUMER_PORT) private readonly consumer: ConsumerPort
	) {}

	onModuleInit() {
		this.consumer.register('tracking', (viewCodes) => this.consume(viewCodes));
	}

	private async consume(viewCodes: string[]) {
		const baseDate = kstBaseDate();
		const dailyStatisticMap = new Map<string, DailyStatistic>();

		for (const viewCode of viewCodes) {
			const [token, pubId, subId] = base64.decode(viewCode).split(':');

			const dailyStatisticDto = dailyStatisticMap.get(viewCode);
			if (dailyStatisticDto) {
				dailyStatisticDto.click += 1;
			} else {
				dailyStatisticMap.set(viewCode, new DailyStatistic({ view_code: viewCode, token, pub_id: pubId || null, sub_id: subId || null, click: 1, created_date: baseDate }));
			}
		}

		// 개별 upsert 실패가 배치 전체를 무한 재소비시키지 않도록 실패는 로그로 격리한다
		const results = await Promise.allSettled([...dailyStatisticMap.values()].map((dailyStatistic) => this.dailyStatisticRepository.upsert(dailyStatistic)));
		for (const result of results) {
			if (result.status === 'rejected') this.logger.error(`daily statistic upsert 실패: ${result.reason}`);
		}
	}
}
