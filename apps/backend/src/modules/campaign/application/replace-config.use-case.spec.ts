import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReplaceConfigUseCase } from './replace-config.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';
import { ReplaceConfigDto } from '@campaign/application/dto/replace-config.dto';

describe('ReplaceConfigUseCase', () => {
	const campaignRepository = { findById: jest.fn(), replaceConfigs: jest.fn() };
	let useCase: ReplaceConfigUseCase;

	const configs: ReplaceConfigDto[] = [{ tracker_event_name: 'purchase', admin_event_name: 'purchase', media_event_name: 'purchase', send_media: true }];

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [ReplaceConfigUseCase, { provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository }],
		}).compile();

		useCase = module.get(ReplaceConfigUseCase);
	});

	it('campaign이 존재하면 config를 전체 교체한다', async () => {
		campaignRepository.findById.mockResolvedValue({ id: 10 });

		await useCase.execute(10, configs);

		expect(campaignRepository.replaceConfigs).toHaveBeenCalledWith(10, configs);
	});

	it('campaign이 없으면 NotFoundException을 던지고 교체하지 않는다', async () => {
		campaignRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(10, configs)).rejects.toThrow(NotFoundException);
		expect(campaignRepository.replaceConfigs).not.toHaveBeenCalled();
	});
});
