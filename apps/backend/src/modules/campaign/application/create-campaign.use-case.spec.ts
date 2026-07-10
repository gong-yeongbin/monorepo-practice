import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateCampaignUseCase } from './create-campaign.use-case';
import { CAMPAIGN_REPOSITORY } from '@campaign/domain/campaign.repository';
import { CreateCampaignDto } from '@campaign/application/dto/create-campaign.dto';

describe('CreateCampaignUseCase', () => {
	const campaignRepository = {
		findAdvertisingTracker: jest.fn(),
		mediaExists: jest.fn(),
		create: jest.fn(),
	};
	let useCase: CreateCampaignUseCase;

	const dto: CreateCampaignDto = { name: 'c', type: 'CPI', advertising_id: 5, media_id: 2 };

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [CreateCampaignUseCase, { provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository }],
		}).compile();

		useCase = module.get(CreateCampaignUseCase);
	});

	it('advertising의 tracker 정보를 도출해 campaign을 생성한다', async () => {
		campaignRepository.findAdvertisingTracker.mockResolvedValue({ tracker_name: 'appsflyer', tracker_tracking_url: 'https://t' });
		campaignRepository.mediaExists.mockResolvedValue(true);
		const created = { id: 10 };
		campaignRepository.create.mockResolvedValue(created);

		expect(await useCase.execute(dto)).toBe(created);
		expect(campaignRepository.create).toHaveBeenCalledWith({
			name: 'c',
			type: 'CPI',
			advertising_id: 5,
			media_id: 2,
			tracker_name: 'appsflyer',
			tracker_tracking_url: 'https://t',
		});
	});

	it('advertising이 없으면 NotFoundException을 던지고 생성하지 않는다', async () => {
		campaignRepository.findAdvertisingTracker.mockResolvedValue(null);

		await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
		expect(campaignRepository.mediaExists).not.toHaveBeenCalled();
		expect(campaignRepository.create).not.toHaveBeenCalled();
	});

	it('media가 없으면 NotFoundException을 던지고 생성하지 않는다', async () => {
		campaignRepository.findAdvertisingTracker.mockResolvedValue({ tracker_name: 'appsflyer', tracker_tracking_url: 'https://t' });
		campaignRepository.mediaExists.mockResolvedValue(false);

		await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
		expect(campaignRepository.create).not.toHaveBeenCalled();
	});
});
