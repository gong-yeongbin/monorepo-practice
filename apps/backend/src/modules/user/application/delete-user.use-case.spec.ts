import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

describe('DeleteUserUseCase', () => {
	const userRepository = { findById: jest.fn(), delete: jest.fn() };
	let useCase: DeleteUserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DeleteUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();
		useCase = module.get(DeleteUserUseCase);
	});

	it('존재하면 user를 삭제한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, user_id: 'admin' });

		await useCase.execute(1);
		expect(userRepository.delete).toHaveBeenCalledWith(1);
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		userRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
		expect(userRepository.delete).not.toHaveBeenCalled();
	});
});
