import { Test } from '@nestjs/testing';
import { ListConfigUseCase } from './list-config.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';

describe('ListConfigUseCase', () => {
	const campaignRepository = { findConfigs: jest.fn() };
	let useCase: ListConfigUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [ListConfigUseCase, { provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository }],
		}).compile();

		useCase = module.get(ListConfigUseCase);
	});

	it('campaign_id로 config 목록을 반환한다', async () => {
		const configs = [{ id: 1, campaign_id: 10 }];
		campaignRepository.findConfigs.mockResolvedValue(configs);

		expect(await useCase.execute(10)).toBe(configs);
		expect(campaignRepository.findConfigs).toHaveBeenCalledWith(10);
	});
});
