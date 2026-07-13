import { Test } from '@nestjs/testing';
import { ListConfigUseCase } from './list-config.use-case';
import { CONFIG_REPOSITORY } from '@config/domain/config.repository';

describe('ListConfigUseCase', () => {
	const configRepository = { findByCampaignId: jest.fn() };
	let useCase: ListConfigUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [ListConfigUseCase, { provide: CONFIG_REPOSITORY, useValue: configRepository }],
		}).compile();

		useCase = module.get(ListConfigUseCase);
	});

	it('campaign_id로 config 목록을 반환한다', async () => {
		const configs = [{ id: 1, campaign_id: 10 }];
		configRepository.findByCampaignId.mockResolvedValue(configs);

		expect(await useCase.execute(10)).toBe(configs);
		expect(configRepository.findByCampaignId).toHaveBeenCalledWith(10);
	});
});
