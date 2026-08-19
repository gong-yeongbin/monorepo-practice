import { Inject, Injectable } from '@nestjs/common';
import { DAILY_REPORT_REPOSITORY, DailyReportRepository } from '@tracking/domain/daily-report.repository';
import { DailyReport, createDailyReport } from '@tracking/domain/daily-report.entity';
import { viewCodeCodec } from '@common/utils/view-code.util';
import { kstBaseDate } from '@common/utils/date.util';

@Injectable()
export class TrackingConsumerUseCase {
	constructor(@Inject(DAILY_REPORT_REPOSITORY) private readonly dailyReportRepository: DailyReportRepository) {}

	async execute(viewCodes: string[]) {
		const baseDate = kstBaseDate();
		const dailyReportMap = new Map<string, DailyReport>();

		for (const viewCode of viewCodes) {
			const [token = '', pubId, subId] = viewCodeCodec.decode(viewCode).split(':');

			let dailyReportDto = dailyReportMap.get(viewCode);
			if (!dailyReportDto) {
				dailyReportDto = createDailyReport({ view_code: viewCode, token, pub_id: pubId || null, sub_id: subId || null, created_date: baseDate });
				dailyReportMap.set(viewCode, dailyReportDto);
			}
			dailyReportDto.click += 1;
		}

		// 배치 전체를 한 문장으로 upsert한다. 실패는 throw로 전파해 배치가 ack되지 않고 재전달되게 한다(문장이 원자적이라 재시도 안전).
		await this.dailyReportRepository.upsertMany([...dailyReportMap.values()]);
	}
}
