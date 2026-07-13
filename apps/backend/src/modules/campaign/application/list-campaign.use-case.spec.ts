import { Test } from '@nestjs/testing';
import { ListCampaignUseCase } from './list-campaign.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';

describe('ListCampaignUseCase', () => {
	const campaignRepository = { findByAdvertisingId: jest.fn() };
	let useCase: ListCampaignUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [ListCampaignUseCase, { provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository }],
		}).compile();
		useCase = module.get(ListCampaignUseCase);
	});

	it('advertising_id로 campaign 목록을 반환한다', async () => {
		const list = [{ campaign_id: 3 }];
		campaignRepository.findByAdvertisingId.mockResolvedValue(list);

		expect(await useCase.execute(1)).toBe(list);
		expect(campaignRepository.findByAdvertisingId).toHaveBeenCalledWith(1);
	});
});
