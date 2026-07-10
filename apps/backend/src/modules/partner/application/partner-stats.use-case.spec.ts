import { Test } from '@nestjs/testing';
import { PartnerStatsUseCase } from './partner-stats.use-case';
import { PARTNER_REPOSITORY } from '@partner/domain/partner.repository';

describe('PartnerStatsUseCase', () => {
	const partnerRepository = { statsByMedia: jest.fn(), statsByAdvertiser: jest.fn() };
	let useCase: PartnerStatsUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [PartnerStatsUseCase, { provide: PARTNER_REPOSITORY, useValue: partnerRepository }],
		}).compile();
		useCase = module.get(PartnerStatsUseCase);
	});

	it('type이 media면 media 기준으로 오늘자 집계한다', async () => {
		const rows = [{ advertising_id: 1 }];
		partnerRepository.statsByMedia.mockResolvedValue(rows);

		expect(await useCase.execute(2, 'media')).toBe(rows);
		expect(partnerRepository.statsByMedia).toHaveBeenCalledWith(2, expect.any(Date));
		expect(partnerRepository.statsByAdvertiser).not.toHaveBeenCalled();
	});

	it('type이 media가 아니면 advertiser 기준으로 집계한다', async () => {
		const rows = [{ advertising_id: 3 }];
		partnerRepository.statsByAdvertiser.mockResolvedValue(rows);

		expect(await useCase.execute(4, 'advertiser')).toBe(rows);
		expect(partnerRepository.statsByAdvertiser).toHaveBeenCalledWith(4, expect.any(Date));
		expect(partnerRepository.statsByMedia).not.toHaveBeenCalled();
	});

	it('type이 없으면 advertiser 기준으로 집계한다', async () => {
		partnerRepository.statsByAdvertiser.mockResolvedValue([]);

		await useCase.execute(5);

		expect(partnerRepository.statsByAdvertiser).toHaveBeenCalledWith(5, expect.any(Date));
	});
});
