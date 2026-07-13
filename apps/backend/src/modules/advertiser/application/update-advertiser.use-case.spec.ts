import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UpdateAdvertiserUseCase } from './update-advertiser.use-case';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/advertiser.repository';

describe('UpdateAdvertiserUseCase', () => {
	const advertiserRepository = { findById: jest.fn(), findByName: jest.fn(), update: jest.fn() };
	let useCase: UpdateAdvertiserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [UpdateAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useValue: advertiserRepository }],
		}).compile();
		useCase = module.get(UpdateAdvertiserUseCase);
	});

	it('존재하고 이름 충돌이 없으면 advertiser를 수정한다', async () => {
		advertiserRepository.findById.mockResolvedValue({ id: 1, name: 'old' });
		advertiserRepository.findByName.mockResolvedValue(null);
		const updated = { id: 1, name: 'new' };
		advertiserRepository.update.mockResolvedValue(updated);

		expect(await useCase.execute(1, { name: 'new' })).toBe(updated);
		expect(advertiserRepository.update).toHaveBeenCalledWith(1, 'new');
	});

	it('같은 이름을 쓰는 게 자기 자신이면 수정을 허용한다', async () => {
		advertiserRepository.findById.mockResolvedValue({ id: 1, name: 'a' });
		advertiserRepository.findByName.mockResolvedValue({ id: 1, name: 'a' });
		advertiserRepository.update.mockResolvedValue({ id: 1, name: 'a' });

		await useCase.execute(1, { name: 'a' });
		expect(advertiserRepository.update).toHaveBeenCalledWith(1, 'a');
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		advertiserRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1, { name: 'a' })).rejects.toThrow(NotFoundException);
		expect(advertiserRepository.update).not.toHaveBeenCalled();
	});

	it('다른 advertiser가 같은 이름을 쓰면 ConflictException을 던진다', async () => {
		advertiserRepository.findById.mockResolvedValue({ id: 1, name: 'old' });
		advertiserRepository.findByName.mockResolvedValue({ id: 2, name: 'new' });

		await expect(useCase.execute(1, { name: 'new' })).rejects.toThrow(ConflictException);
		expect(advertiserRepository.update).not.toHaveBeenCalled();
	});
});
