// PartnerController가 통계 조회를 use-case에 위임하는지 검증
import { PartnerController } from './partner.controller';
import { PartnerStatsUseCase } from '@partner/application/partner-stats.use-case';

describe('PartnerController', () => {
	const partnerStatsUseCase = { execute: jest.fn() } as unknown as PartnerStatsUseCase;
	const controller = new PartnerController(partnerStatsUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('param.id와 query.type을 use-case에 위임한다', async () => {
		const rows = [{ advertising_id: 1 }];
		(partnerStatsUseCase.execute as jest.Mock).mockResolvedValue(rows);

		expect(await controller.get({ id: 2 }, { type: 'media' })).toBe(rows);
		expect(partnerStatsUseCase.execute).toHaveBeenCalledWith(2, 'media');
	});
});
