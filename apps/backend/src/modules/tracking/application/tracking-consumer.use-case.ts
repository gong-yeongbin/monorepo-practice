import { Inject, Injectable, Logger } from '@nestjs/common';
import { DAILY_REPORT_REPOSITORY, DailyReportRepository } from '@tracking/domain/daily-report.repository';
import { DailyReport, createDailyReport } from '@tracking/domain/daily-report.entity';
import { viewCodeCodec } from '@common/utils/view-code.util';
import { kstBaseDate } from '@common/utils/date.util';

// campaign.token은 VarChar(36)이라 이보다 긴 token은 어떤 캠페인과도 매칭될 수 없다.
// decode는 실패해도 던지지 않고 입력(암호문)을 그대로 돌려주므로, 복호화 실패는 이 길이로 걸러진다.
const CAMPAIGN_TOKEN_MAX_LENGTH = 36;

@Injectable()
export class TrackingConsumerUseCase {
	private readonly logger = new Logger(TrackingConsumerUseCase.name);

	constructor(@Inject(DAILY_REPORT_REPOSITORY) private readonly dailyReportRepository: DailyReportRepository) {}

	async execute(viewCodes: string[]) {
		// [임시 계측] 배치 1건에 약 9초가 걸리는데 CPU·DB·Redis 어디에서도 시간이 잡히지 않아 구간을 나눠 잰다. 원인 확인 후 제거할 것.
		const startedAt = Date.now();
		const baseDate = kstBaseDate();
		const dailyReportMap = new Map<string, DailyReport>();

		for (const viewCode of viewCodes) {
			const [token = '', pubId, subId] = viewCodeCodec.decode(viewCode).split(':');

			// 복호화 실패·형식 이상으로 캠페인과 매칭될 수 없는 token은 담지 않는다.
			// 담으면 daily_report.token FK 위반으로 배치 한 문장이 통째로 롤백되고, 재전달을 반복하다
			// 전달 횟수 초과로 정상 클릭까지 함께 폐기된다.
			if (!token || token.length > CAMPAIGN_TOKEN_MAX_LENGTH) {
				this.logger.warn(`복호화할 수 없는 viewCode의 클릭을 건너뜁니다: ${viewCode}`);
				continue;
			}

			let dailyReportDto = dailyReportMap.get(viewCode);
			if (!dailyReportDto) {
				dailyReportDto = createDailyReport({ view_code: viewCode, token, pub_id: pubId || null, sub_id: subId || null, created_date: baseDate });
				dailyReportMap.set(viewCode, dailyReportDto);
			}
			dailyReportDto.click += 1;
		}

		const dailyReports = [...dailyReportMap.values()];
		const aggregatedAt = Date.now();

		// 배치 전체를 한 문장으로 upsert한다. 실패는 throw로 전파해 배치가 ack되지 않고 재전달되게 한다(문장이 원자적이라 재시도 안전).
		try {
			await this.dailyReportRepository.upsertMany(dailyReports);
		} catch (error) {
			// 폴백이 전부 성공하면 아래 upsertOneByOne이 아무것도 남기지 않아, 배치가 매번 깨지고 있어도 로그가 조용하다.
			this.logger.warn(`배치 upsert 실패로 행 단위 재시도로 전환합니다: ${String(error)}`);
			await this.upsertOneByOne(dailyReports, error);
		}

		// [임시 계측] 위 startedAt 주석 참고.
		this.logger.log(`batch=${viewCodes.length} rows=${dailyReports.length} agg=${aggregatedAt - startedAt}ms upsert=${Date.now() - aggregatedAt}ms`);
	}

	// 배치가 한 문장이라 나쁜 행 하나가 전체를 롤백시킨다(삭제된 캠페인의 FK 위반 등).
	// 행 단위로 다시 시도해 정상 행은 살리고 실패한 행만 버린다.
	// 전부 실패하면 데이터 문제가 아니라 인프라 장애로 보고 원래 예외를 전파해 배치를 재전달시킨다.
	private async upsertOneByOne(dailyReports: DailyReport[], batchError: unknown) {
		const results = await Promise.allSettled(dailyReports.map((dailyReport) => this.dailyReportRepository.upsertMany([dailyReport])));
		const rejected = results.filter((result) => result.status === 'rejected');
		if (rejected.length === dailyReports.length) throw batchError;

		for (const [index, result] of results.entries()) {
			if (result.status === 'rejected') this.logger.error(`daily report 행 저장에 실패해 건너뜁니다: view_code=${dailyReports[index]?.view_code}, ${result.reason}`);
		}
	}
}
