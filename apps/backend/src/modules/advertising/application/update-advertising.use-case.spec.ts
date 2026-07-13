import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UpdateAdvertisingUseCase } from './update-advertising.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';

describe('UpdateAdvertisingUseCase', () => {
	const advertisingRepository = { exists: jest.fn(), trackerExists: jest.fn(), advertiserExists: jest.fn(), findByName: jest.fn(), update: jest.fn() };
	let useCase: UpdateAdvertisingUseCase;

	const dto = { name: 'ad', image: 'img', advertiser_id: 1, tracker_id: 2 };

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [UpdateAdvertisingUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(UpdateAdvertisingUseCase);
	});

	it('존재하고 tracker·advertiser가 있으며 이름 충돌이 없으면 advertising을 수정한다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);
		advertisingRepository.trackerExists.mockResolvedValue(true);
		advertisingRepository.advertiserExists.mockResolvedValue(true);
		advertisingRepository.findByName.mockResolvedValue(null);
		const updated = { id: 1, ...dto };
		advertisingRepository.update.mockResolvedValue(updated);

		expect(await useCase.execute(1, dto)).toBe(updated);
		expect(advertisingRepository.update).toHaveBeenCalledWith(1, { name: 'ad', image: 'img', advertiser_id: 1, tracker_id: 2 });
	});

	it('image가 없으면 null로 저장한다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);
		advertisingRepository.trackerExists.mockResolvedValue(true);
		advertisingRepository.advertiserExists.mockResolvedValue(true);
		advertisingRepository.findByName.mockResolvedValue(null);
		advertisingRepository.update.mockResolvedValue({ id: 1 });

		await useCase.execute(1, { name: 'ad', advertiser_id: 1, tracker_id: 2 });
		expect(advertisingRepository.update).toHaveBeenCalledWith(1, { name: 'ad', image: null, advertiser_id: 1, tracker_id: 2 });
	});

	it('같은 이름을 쓰는 게 자기 자신이면 수정을 허용한다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);
		advertisingRepository.trackerExists.mockResolvedValue(true);
		advertisingRepository.advertiserExists.mockResolvedValue(true);
		advertisingRepository.findByName.mockResolvedValue({ id: 1, name: 'ad' });
		advertisingRepository.update.mockResolvedValue({ id: 1 });

		await useCase.execute(1, dto);
		expect(advertisingRepository.update).toHaveBeenCalled();
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		advertisingRepository.exists.mockResolvedValue(false);

		await expect(useCase.execute(1, dto)).rejects.toThrow(NotFoundException);
		expect(advertisingRepository.update).not.toHaveBeenCalled();
	});

	it('tracker가 없으면 NotFoundException을 던진다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);
		advertisingRepository.trackerExists.mockResolvedValue(false);

		await expect(useCase.execute(1, dto)).rejects.toThrow(NotFoundException);
		expect(advertisingRepository.update).not.toHaveBeenCalled();
	});

	it('advertiser가 없으면 NotFoundException을 던진다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);
		advertisingRepository.trackerExists.mockResolvedValue(true);
		advertisingRepository.advertiserExists.mockResolvedValue(false);

		await expect(useCase.execute(1, dto)).rejects.toThrow(NotFoundException);
		expect(advertisingRepository.update).not.toHaveBeenCalled();
	});

	it('다른 advertising이 같은 이름을 쓰면 ConflictException을 던진다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);
		advertisingRepository.trackerExists.mockResolvedValue(true);
		advertisingRepository.advertiserExists.mockResolvedValue(true);
		advertisingRepository.findByName.mockResolvedValue({ id: 2, name: 'ad' });

		await expect(useCase.execute(1, dto)).rejects.toThrow(ConflictException);
		expect(advertisingRepository.update).not.toHaveBeenCalled();
	});
});
