import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

describe('UpdateUserUseCase', () => {
	const userRepository = { findById: jest.fn(), update: jest.fn() };
	let useCase: UpdateUserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [UpdateUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();
		useCase = module.get(UpdateUserUseCase);
	});

	it('role·approved를 수정해 user를 반환한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, email: 'admin@example.com', role: 'ADMIN', approved: false });
		const updated = { id: 1, email: 'admin@example.com', role: 'MEDIA', approved: true };
		userRepository.update.mockResolvedValue(updated);

		const result = await useCase.execute(1, { role: 'MEDIA', approved: true });

		expect(userRepository.update).toHaveBeenCalledWith(1, { role: 'MEDIA', approved: true });
		expect(result).toBe(updated);
	});

	it('approved만 주면 approved만 수정한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, email: 'admin@example.com', role: 'ADMIN', approved: false });
		userRepository.update.mockResolvedValue({ id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true });

		await useCase.execute(1, { approved: true });

		expect(userRepository.update).toHaveBeenCalledWith(1, { approved: true });
	});

	it('빈 dto면 아무 필드 없이 update를 호출한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true });
		userRepository.update.mockResolvedValue({ id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true });

		await useCase.execute(1, {});

		expect(userRepository.update).toHaveBeenCalledWith(1, {});
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		userRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1, { role: 'ADMIN' })).rejects.toThrow(NotFoundException);
		expect(userRepository.update).not.toHaveBeenCalled();
	});
});
