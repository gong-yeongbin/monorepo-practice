// tracking consumer use-case가 viewCode별 클릭을 집계해 배치 upsert하고 실패를 전파하는지 검증
import { Test } from '@nestjs/testing';
import { TrackingConsumerUseCase } from './tracking-consumer.use-case';
import { DAILY_REPORT_REPOSITORY } from '@tracking/domain/daily-report.repository';
import { viewCodeCodec } from '@common/utils/view-code.util';

describe('TrackingConsumerUseCase', () => {
	const dailyReportRepository = { upsertMany: jest.fn() };
	let useCase: TrackingConsumerUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [TrackingConsumerUseCase, { provide: DAILY_REPORT_REPOSITORY, useValue: dailyReportRepository }],
		}).compile();
		useCase = module.get(TrackingConsumerUseCase);
	});

	it('같은 viewCode의 클릭을 합산하고 token·pub·sub를 디코드해 배치 upsert한다', async () => {
		dailyReportRepository.upsertMany.mockResolvedValue(undefined);
		const viewCode = viewCodeCodec.encode('token-1:pub-1:sub-1');

		await useCase.execute([viewCode, viewCode, viewCode]);

		expect(dailyReportRepository.upsertMany).toHaveBeenCalledTimes(1);
		const reports = dailyReportRepository.upsertMany.mock.calls[0][0];
		expect(reports).toHaveLength(1);
		expect(reports[0].click).toBe(3);
		expect(reports[0].token).toBe('token-1');
		expect(reports[0].pub_id).toBe('pub-1');
		expect(reports[0].sub_id).toBe('sub-1');
	});

	it('서로 다른 viewCode는 하나의 배치에 각각의 리포트로 담는다', async () => {
		dailyReportRepository.upsertMany.mockResolvedValue(undefined);

		await useCase.execute([viewCodeCodec.encode('t1::'), viewCodeCodec.encode('t2::')]);

		expect(dailyReportRepository.upsertMany).toHaveBeenCalledTimes(1);
		expect(dailyReportRepository.upsertMany.mock.calls[0][0]).toHaveLength(2);
	});

	it('배치 upsert 실패는 전파한다 (ack하지 않고 재전달되도록)', async () => {
		const error = new Error('db down');
		dailyReportRepository.upsertMany.mockRejectedValue(error);

		await expect(useCase.execute([viewCodeCodec.encode('t1::')])).rejects.toBe(error);
	});
});
