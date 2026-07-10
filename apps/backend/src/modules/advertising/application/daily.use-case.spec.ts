import { Test } from '@nestjs/testing';
import { DailyUseCase } from './daily.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('DailyUseCase', () => {
	const advertisingRepository = { daily: jest.fn() };
	let useCase: DailyUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DailyUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(DailyUseCase);
	});

	it('token과 변환된 날짜 범위를 repository에 넘긴다', async () => {
		const rows = [{ created_date: new Date('2026-07-10') }];
		advertisingRepository.daily.mockResolvedValue(rows);

		expect(await useCase.execute({ token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' })).toBe(rows);
		expect(advertisingRepository.daily).toHaveBeenCalledWith('tok', { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') });
	});
});
