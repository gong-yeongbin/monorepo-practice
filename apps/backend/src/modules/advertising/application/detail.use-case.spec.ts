import { Test } from '@nestjs/testing';
import { DetailUseCase } from './detail.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('DetailUseCase', () => {
	const advertisingRepository = { detail: jest.fn() };
	let useCase: DetailUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DetailUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(DetailUseCase);
	});

	it('media_id가 있으면 함께 넘긴다', async () => {
		const rows = [{ campaign_id: 3 }];
		advertisingRepository.detail.mockResolvedValue(rows);

		expect(await useCase.execute(1, { start_date: '2026-07-01', end_date: '2026-07-10', media_id: 2 })).toBe(rows);
		expect(advertisingRepository.detail).toHaveBeenCalledWith(1, { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, 2);
	});

	it('media_id가 없으면 undefined로 넘긴다', async () => {
		advertisingRepository.detail.mockResolvedValue([]);

		await useCase.execute(1, { start_date: '2026-07-01', end_date: '2026-07-10' });

		expect(advertisingRepository.detail).toHaveBeenCalledWith(1, { start_date: new Date('2026-07-01'), end_date: new Date('2026-07-10') }, undefined);
	});
});
