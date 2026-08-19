import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteCampaignUseCase } from './delete-campaign.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';
import { CACHE_PORT } from '@infra/cache/cache.port';

describe('DeleteCampaignUseCase', () => {
	const campaignRepository = { findById: jest.fn(), delete: jest.fn() };
	const cache = { del: jest.fn() };
	let useCase: DeleteCampaignUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [
				DeleteCampaignUseCase,
				{ provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
				{ provide: CACHE_PORT, useValue: cache },
			],
		}).compile();

		useCase = module.get(DeleteCampaignUseCase);
	});

	it('존재하면 삭제하고 캐시를 무효화한다', async () => {
		campaignRepository.findById.mockResolvedValue({ id: 1, token: 'token-1' });

		await useCase.execute(1);

		expect(campaignRepository.delete).toHaveBeenCalledWith(1);
		expect(cache.del).toHaveBeenCalledWith('campaign:token-1');
	});

	it('없으면 NotFoundException을 던지고 삭제하지 않는다', async () => {
		campaignRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
		expect(campaignRepository.delete).not.toHaveBeenCalled();
		expect(cache.del).not.toHaveBeenCalled();
	});
});
