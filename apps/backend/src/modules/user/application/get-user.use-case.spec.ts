import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserUseCase } from './get-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

describe('GetUserUseCase', () => {
	const userRepository = { findById: jest.fn() };
	let useCase: GetUserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [GetUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();
		useCase = module.get(GetUserUseCase);
	});

	it('존재하면 user를 반환한다', async () => {
		const user = { id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true };
		userRepository.findById.mockResolvedValue(user);

		expect(await useCase.execute(1)).toBe(user);
	});

	it('없으면 NotFoundException을 던진다', async () => {
		userRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
	});
});
