import { Inject, Injectable, Logger } from '@nestjs/common';
import { DAILY_REPORT_REPOSITORY, DailyReportRepository } from '@tracking/domain/daily-report.repository';
import { DailyReport } from '@tracking/domain/daily-report.entity';
import { viewCodeCodec } from '@common/utils/view-code.util';
import { kstBaseDate } from '@common/utils/date.util';

@Injectable()
export class TrackingConsumerUseCase {
	private readonly logger = new Logger(TrackingConsumerUseCase.name);

	constructor(@Inject(DAILY_REPORT_REPOSITORY) private readonly dailyReportRepository: DailyReportRepository) {}

	async execute(viewCodes: string[]) {
		const baseDate = kstBaseDate();
		const dailyReportMap = new Map<string, DailyReport>();

		for (const viewCode of viewCodes) {
			const [token = '', pubId, subId] = viewCodeCodec.decode(viewCode).split(':');

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
