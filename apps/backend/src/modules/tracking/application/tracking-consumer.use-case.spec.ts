// tracking consumer use-case가 viewCode별 클릭을 집계하고 upsert 실패를 격리하는지 검증
import { Test } from '@nestjs/testing';
import { TrackingConsumerUseCase } from './tracking-consumer.use-case';
import { DAILY_REPORT_REPOSITORY } from '@tracking/domain/daily-report.repository';
import { viewCodeCodec } from '@common/utils/view-code.util';

describe('TrackingConsumerUseCase', () => {
	const dailyReportRepository = { upsert: jest.fn() };
	let useCase: TrackingConsumerUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [TrackingConsumerUseCase, { provide: DAILY_REPORT_REPOSITORY, useValue: dailyReportRepository }],
		}).compile();
		useCase = module.get(TrackingConsumerUseCase);
	});

	it('같은 viewCode의 클릭을 합산하고 token·pub·sub를 디코드해 upsert한다', async () => {
		dailyReportRepository.upsert.mockResolvedValue(undefined);
		const viewCode = viewCodeCodec.encode('token-1:pub-1:sub-1');

		await useCase.execute([viewCode, viewCode, viewCode]);

		expect(dailyReportRepository.upsert).toHaveBeenCalledTimes(1);
		const report = dailyReportRepository.upsert.mock.calls[0][0];
		expect(report.click).toBe(3);
		expect(report.token).toBe('token-1');
		expect(report.pub_id).toBe('pub-1');
		expect(report.sub_id).toBe('sub-1');
	});

	it('서로 다른 viewCode는 각각 upsert한다', async () => {
		dailyReportRepository.upsert.mockResolvedValue(undefined);

		await useCase.execute([viewCodeCodec.encode('t1::'), viewCodeCodec.encode('t2::')]);

		expect(dailyReportRepository.upsert).toHaveBeenCalledTimes(2);
	});

	it('개별 upsert가 실패해도 예외를 전파하지 않고 나머지를 처리한다', async () => {
		dailyReportRepository.upsert.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('db down'));

		await expect(useCase.execute([viewCodeCodec.encode('t1::'), viewCodeCodec.encode('t2::')])).resolves.toBeUndefined();
		expect(dailyReportRepository.upsert).toHaveBeenCalledTimes(2);
	});
});
