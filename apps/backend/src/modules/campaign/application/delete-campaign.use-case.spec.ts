import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteCampaignUseCase } from './delete-campaign.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';

describe('DeleteCampaignUseCase', () => {
	const campaignRepository = { findById: jest.fn(), delete: jest.fn() };
	let useCase: DeleteCampaignUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [DeleteCampaignUseCase, { provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository }],
		}).compile();

		useCase = module.get(DeleteCampaignUseCase);
	});

	it('존재하면 삭제한다', async () => {
		campaignRepository.findById.mockResolvedValue({ id: 1 });

		await useCase.execute(1);

		expect(campaignRepository.delete).toHaveBeenCalledWith(1);
	});

	it('없으면 NotFoundException을 던지고 삭제하지 않는다', async () => {
		campaignRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
		expect(campaignRepository.delete).not.toHaveBeenCalled();
	});
});
