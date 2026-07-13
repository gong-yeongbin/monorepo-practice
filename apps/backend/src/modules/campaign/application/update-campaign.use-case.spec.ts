import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateCampaignUseCase } from './update-campaign.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';

describe('UpdateCampaignUseCase', () => {
	const campaignRepository = { findById: jest.fn(), mediaExists: jest.fn(), update: jest.fn() };
	let useCase: UpdateCampaignUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [UpdateCampaignUseCase, { provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository }],
		}).compile();

		useCase = module.get(UpdateCampaignUseCase);
	});

	it('campaign이 없으면 NotFoundException을 던진다', async () => {
		campaignRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1, { name: 'x' })).rejects.toThrow(NotFoundException);
		expect(campaignRepository.update).not.toHaveBeenCalled();
	});

	it('media_id가 있고 media가 없으면 NotFoundException을 던진다', async () => {
		campaignRepository.findById.mockResolvedValue({ id: 1 });
		campaignRepository.mediaExists.mockResolvedValue(false);

		await expect(useCase.execute(1, { media_id: 2 })).rejects.toThrow(NotFoundException);
		expect(campaignRepository.update).not.toHaveBeenCalled();
	});

	it('media_id가 없으면 media 검증을 건너뛰고 전달된 필드로 수정한다', async () => {
		campaignRepository.findById.mockResolvedValue({ id: 1 });
		const updated = { id: 1, is_active: false };
		campaignRepository.update.mockResolvedValue(updated);

		expect(await useCase.execute(1, { is_active: false })).toBe(updated);
		expect(campaignRepository.mediaExists).not.toHaveBeenCalled();
		expect(campaignRepository.update).toHaveBeenCalledWith(1, { name: undefined, type: undefined, media_id: undefined, is_active: false });
	});

	it('media_id가 유효하면 검증 후 수정한다', async () => {
		campaignRepository.findById.mockResolvedValue({ id: 1 });
		campaignRepository.mediaExists.mockResolvedValue(true);
		const updated = { id: 1, media_id: 2 };
		campaignRepository.update.mockResolvedValue(updated);

		expect(await useCase.execute(1, { media_id: 2 })).toBe(updated);
		expect(campaignRepository.mediaExists).toHaveBeenCalledWith(2);
		expect(campaignRepository.update).toHaveBeenCalledWith(1, { name: undefined, type: undefined, media_id: 2, is_active: undefined });
	});
});
