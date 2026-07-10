import { Test } from '@nestjs/testing';
import { CampaignListUseCase } from './campaign-list.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('CampaignListUseCase', () => {
	const advertisingRepository = { campaignList: jest.fn() };
	let useCase: CampaignListUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [CampaignListUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(CampaignListUseCase);
	});

	it('advertising_id로 campaign 목록을 반환한다', async () => {
		const list = [{ campaign_id: 3 }];
		advertisingRepository.campaignList.mockResolvedValue(list);

		expect(await useCase.execute(1)).toBe(list);
		expect(advertisingRepository.campaignList).toHaveBeenCalledWith(1);
	});
});
