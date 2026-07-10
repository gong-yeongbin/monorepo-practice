import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCampaignUseCase } from './get-campaign.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';

describe('GetCampaignUseCase', () => {
	const campaignRepository = { findById: jest.fn() };
	let useCase: GetCampaignUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [GetCampaignUseCase, { provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository }],
		}).compile();

		useCase = module.get(GetCampaignUseCase);
	});

	it('존재하면 campaign을 반환한다', async () => {
		const campaign = { id: 1 };
		campaignRepository.findById.mockResolvedValue(campaign);

		expect(await useCase.execute(1)).toBe(campaign);
	});

	it('없으면 NotFoundException을 던진다', async () => {
		campaignRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
	});
});
