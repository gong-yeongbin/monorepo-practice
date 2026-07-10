import { Test } from '@nestjs/testing';
import { BriefAdvertisingUseCase } from './brief-advertising.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('BriefAdvertisingUseCase', () => {
	const advertisingRepository = { brief: jest.fn() };
	let useCase: BriefAdvertisingUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [BriefAdvertisingUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(BriefAdvertisingUseCase);
	});

	it('repository의 간략 목록을 반환한다', async () => {
		const list = [{ id: 1, name: 'a', image: null, tracker: 't' }];
		advertisingRepository.brief.mockResolvedValue(list);

		expect(await useCase.execute()).toBe(list);
	});
});
