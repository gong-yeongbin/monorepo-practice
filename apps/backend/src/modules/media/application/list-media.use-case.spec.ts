import { Test } from '@nestjs/testing';
import { ListMediaUseCase } from './list-media.use-case';
import { MEDIA_REPOSITORY } from '@media/domain/media.repository';

describe('ListMediaUseCase', () => {
	const mediaRepository = { findAllWithCampaignCount: jest.fn() };
	let useCase: ListMediaUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [ListMediaUseCase, { provide: MEDIA_REPOSITORY, useValue: mediaRepository }],
		}).compile();

		useCase = module.get(ListMediaUseCase);
	});

	it('repository의 media 목록을 반환한다', async () => {
		const list = [{ id: 1, name: 'm1', install_postback_url: 'i1', event_postback_url: 'e1', campaign: 2 }];
		mediaRepository.findAllWithCampaignCount.mockResolvedValue(list);

		expect(await useCase.execute()).toBe(list);
	});
});
