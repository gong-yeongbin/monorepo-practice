import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ToggleCampaignUseCase } from './toggle-campaign.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';

describe('ToggleCampaignUseCase', () => {
	const campaignRepository = { findById: jest.fn(), setActive: jest.fn() };
	let useCase: ToggleCampaignUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [ToggleCampaignUseCase, { provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository }],
		}).compile();

		useCase = module.get(ToggleCampaignUseCase);
	});

	it('is_active가 true면 false로 토글한다', async () => {
		campaignRepository.findById.mockResolvedValue({ id: 1, is_active: true });

		await useCase.execute(1);

		expect(campaignRepository.setActive).toHaveBeenCalledWith(1, false);
	});

	it('is_active가 false면 true로 토글한다', async () => {
		campaignRepository.findById.mockResolvedValue({ id: 1, is_active: false });

		await useCase.execute(1);

		expect(campaignRepository.setActive).toHaveBeenCalledWith(1, true);
	});

	it('없으면 NotFoundException을 던진다', async () => {
		campaignRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
		expect(campaignRepository.setActive).not.toHaveBeenCalled();
	});
});
