import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DAILY_REPORT_REPOSITORY, DailyReportRepository } from '@campaign/domain/daily-report.repository';
import { DailyReport } from '@campaign/domain/daily-report.entity';
import { CONSUMER_PORT, ConsumerPort } from '@core/kafka/consumer.port';
import { base64 } from '@src/common/util/base64.util';
import { kstBaseDate } from '@src/common/util/date.util';

@Injectable()
export class TrackingConsumerUseCase implements OnModuleInit {
	private readonly logger = new Logger(TrackingConsumerUseCase.name);

	constructor(
		@Inject(DAILY_REPORT_REPOSITORY) private readonly dailyReportRepository: DailyReportRepository,
		@Inject(CONSUMER_PORT) private readonly consumer: ConsumerPort
	) {}

	onModuleInit() {
		this.consumer.register('tracking', (viewCodes) => this.consume(viewCodes));
	}

	private async consume(viewCodes: string[]) {
		const baseDate = kstBaseDate();
		const dailyReportMap = new Map<string, DailyReport>();

		for (const viewCode of viewCodes) {
			const [token = '', pubId, subId] = base64.decode(viewCode).split(':');

			const dailyReportDto = dailyReportMap.get(viewCode);
			if (dailyReportDto) {
				dailyReportDto.click += 1;
			} else {
				dailyReportMap.set(viewCode, new DailyReport({ view_code: viewCode, token, pub_id: pubId || null, sub_id: subId || null, click: 1, created_date: baseDate }));
			}
		}

		// 개별 upsert 실패가 배치 전체를 무한 재소비시키지 않도록 실패는 로그로 격리한다
		const results = await Promise.allSettled([...dailyReportMap.values()].map((dailyReport) => this.dailyReportRepository.upsert(dailyReport)));
		for (const result of results) {
			if (result.status === 'rejected') this.logger.error(`daily report upsert 실패: ${result.reason}`);
		}
	}
}
