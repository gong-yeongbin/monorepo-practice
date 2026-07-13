import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UpdateTrackerUseCase } from './update-tracker.use-case';
import { TRACKER_REPOSITORY } from '@tracker/domain/tracker.repository';

describe('UpdateTrackerUseCase', () => {
	const trackerRepository = { findById: jest.fn(), findByName: jest.fn(), update: jest.fn() };
	let useCase: UpdateTrackerUseCase;

	const dto = { name: 'airbridge', tracking_url: 't', install_postback_url: 'i', event_postback_url: 'e' };

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [UpdateTrackerUseCase, { provide: TRACKER_REPOSITORY, useValue: trackerRepository }],
		}).compile();
		useCase = module.get(UpdateTrackerUseCase);
	});

	it('존재하고 이름 충돌이 없으면 tracker를 수정한다', async () => {
		trackerRepository.findById.mockResolvedValue({ id: 1, name: 'appsflyer' });
		trackerRepository.findByName.mockResolvedValue(null);
		const updated = { id: 1, ...dto };
		trackerRepository.update.mockResolvedValue(updated);

		expect(await useCase.execute(1, dto)).toBe(updated);
		expect(trackerRepository.update).toHaveBeenCalledWith(1, dto);
	});

	it('같은 이름을 쓰는 게 자기 자신이면 수정을 허용한다', async () => {
		trackerRepository.findById.mockResolvedValue({ id: 1, name: 'airbridge' });
		trackerRepository.findByName.mockResolvedValue({ id: 1, name: 'airbridge' });
		trackerRepository.update.mockResolvedValue({ id: 1, ...dto });

		await useCase.execute(1, dto);
		expect(trackerRepository.update).toHaveBeenCalledWith(1, dto);
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		trackerRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1, dto)).rejects.toThrow(NotFoundException);
		expect(trackerRepository.update).not.toHaveBeenCalled();
	});

	it('다른 tracker가 같은 이름을 쓰면 ConflictException을 던진다', async () => {
		trackerRepository.findById.mockResolvedValue({ id: 1, name: 'appsflyer' });
		trackerRepository.findByName.mockResolvedValue({ id: 2, name: 'airbridge' });

		await expect(useCase.execute(1, dto)).rejects.toThrow(ConflictException);
		expect(trackerRepository.update).not.toHaveBeenCalled();
	});
});
