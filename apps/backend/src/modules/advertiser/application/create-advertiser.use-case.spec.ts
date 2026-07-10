import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateAdvertiserUseCase } from './create-advertiser.use-case';
import { ADVERTISER_REPOSITORY } from '@advertiser/domain/advertiser.repository';

describe('CreateAdvertiserUseCase', () => {
	const advertiserRepository = { findAll: jest.fn(), findByName: jest.fn(), create: jest.fn() };
	let useCase: CreateAdvertiserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [CreateAdvertiserUseCase, { provide: ADVERTISER_REPOSITORY, useValue: advertiserRepository }],
		}).compile();

		useCase = module.get(CreateAdvertiserUseCase);
	});

	it('이름이 중복되지 않으면 생성 결과를 반환한다', async () => {
		const created = { id: 1, name: 'a' };
		advertiserRepository.findByName.mockResolvedValue(null);
		advertiserRepository.create.mockResolvedValue(created);

		expect(await useCase.execute({ name: 'a' })).toBe(created);
		expect(advertiserRepository.create).toHaveBeenCalledWith('a');
	});

	it('이름이 이미 존재하면 ConflictException을 던지고 생성하지 않는다', async () => {
		advertiserRepository.findByName.mockResolvedValue({ id: 1, name: 'a' });

		await expect(useCase.execute({ name: 'a' })).rejects.toThrow(ConflictException);
		expect(advertiserRepository.create).not.toHaveBeenCalled();
	});
});
