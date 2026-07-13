import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateTrackerUseCase } from './create-tracker.use-case';
import { TRACKER_REPOSITORY } from '@tracker/domain/tracker.repository';

describe('CreateTrackerUseCase', () => {
	const trackerRepository = { findByName: jest.fn(), create: jest.fn() };
	let useCase: CreateTrackerUseCase;

	const dto = { name: 'appsflyer', tracking_url: 't', install_postback_url: 'i', event_postback_url: 'e' };

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [CreateTrackerUseCase, { provide: TRACKER_REPOSITORY, useValue: trackerRepository }],
		}).compile();
		useCase = module.get(CreateTrackerUseCase);
	});

	it('이름이 중복되지 않으면 tracker를 생성한다', async () => {
		trackerRepository.findByName.mockResolvedValue(null);
		const created = { id: 1, ...dto };
		trackerRepository.create.mockResolvedValue(created);

		expect(await useCase.execute(dto)).toBe(created);
		expect(trackerRepository.create).toHaveBeenCalledWith(dto);
	});

	it('이름이 이미 존재하면 ConflictException을 던진다', async () => {
		trackerRepository.findByName.mockResolvedValue({ id: 1, ...dto });

		await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
		expect(trackerRepository.create).not.toHaveBeenCalled();
	});
});
