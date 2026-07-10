import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateAdvertisingUseCase } from './create-advertising.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';
import { CreateAdvertisingDto } from '@advertising/application/dto/create-advertising.dto';

describe('CreateAdvertisingUseCase', () => {
	const advertisingRepository = {
		trackerExists: jest.fn(),
		advertiserExists: jest.fn(),
		findByName: jest.fn(),
		create: jest.fn(),
	};
	let useCase: CreateAdvertisingUseCase;

	const dto: CreateAdvertisingDto = { name: 'ad', advertiser_id: 1, tracker_id: 2, image: 'https://img' };

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [CreateAdvertisingUseCase, { provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository }],
		}).compile();
		useCase = module.get(CreateAdvertisingUseCase);
	});

	it('검증을 통과하면 image URL과 함께 생성한다', async () => {
		advertisingRepository.trackerExists.mockResolvedValue(true);
		advertisingRepository.advertiserExists.mockResolvedValue(true);
		advertisingRepository.findByName.mockResolvedValue(null);
		const created = { id: 5 };
		advertisingRepository.create.mockResolvedValue(created);

		expect(await useCase.execute(dto)).toBe(created);
		expect(advertisingRepository.create).toHaveBeenCalledWith({ name: 'ad', image: 'https://img', advertiser_id: 1, tracker_id: 2 });
	});

	it('image가 없으면 null로 저장한다', async () => {
		advertisingRepository.trackerExists.mockResolvedValue(true);
		advertisingRepository.advertiserExists.mockResolvedValue(true);
		advertisingRepository.findByName.mockResolvedValue(null);
		advertisingRepository.create.mockResolvedValue({ id: 5 });

		await useCase.execute({ name: 'ad', advertiser_id: 1, tracker_id: 2 });

		expect(advertisingRepository.create).toHaveBeenCalledWith(expect.objectContaining({ image: null }));
	});

	it('tracker가 없으면 NotFoundException', async () => {
		advertisingRepository.trackerExists.mockResolvedValue(false);

		await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
		expect(advertisingRepository.create).not.toHaveBeenCalled();
	});

	it('advertiser가 없으면 NotFoundException', async () => {
		advertisingRepository.trackerExists.mockResolvedValue(true);
		advertisingRepository.advertiserExists.mockResolvedValue(false);

		await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
		expect(advertisingRepository.create).not.toHaveBeenCalled();
	});

	it('이름이 중복이면 ConflictException', async () => {
		advertisingRepository.trackerExists.mockResolvedValue(true);
		advertisingRepository.advertiserExists.mockResolvedValue(true);
		advertisingRepository.findByName.mockResolvedValue({ id: 9, name: 'ad' });

		await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
		expect(advertisingRepository.create).not.toHaveBeenCalled();
	});
});
