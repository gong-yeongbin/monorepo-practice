import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

describe('UpdateUserUseCase', () => {
	const userRepository = { findById: jest.fn(), update: jest.fn(), countAdvertising: jest.fn() };
	let useCase: UpdateUserUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [UpdateUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();
		useCase = module.get(UpdateUserUseCase);
	});

	it('role·approved를 수정해 user를 반환한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, email: 'admin@example.com', role: 'USER', approved: false });
		const updated = { id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true };
		userRepository.update.mockResolvedValue(updated);

		const result = await useCase.execute(1, { role: 'ADMIN', approved: true });

		expect(userRepository.update).toHaveBeenCalledWith(1, { role: 'ADMIN', approved: true });
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
		expect(userRepository.countAdvertising).not.toHaveBeenCalled();
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		userRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1, { role: 'ADMIN' })).rejects.toThrow(NotFoundException);
		expect(userRepository.update).not.toHaveBeenCalled();
	});

	it('승인과 함께 허용 광고 목록을 지정한다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1, email: 'a@example.com', role: 'USER', approved: false });
		userRepository.countAdvertising.mockResolvedValue(2);
		userRepository.update.mockResolvedValue({ id: 1 });

		await useCase.execute(1, { approved: true, advertising_ids: [1, 2] });

		expect(userRepository.countAdvertising).toHaveBeenCalledWith([1, 2]);
		expect(userRepository.update).toHaveBeenCalledWith(1, { approved: true, advertising_ids: [1, 2] });
	});

	// 중복 id는 user_advertising 복합 PK 충돌을 낸다
	it('중복 광고 id는 제거하고 넘긴다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1 });
		userRepository.countAdvertising.mockResolvedValue(1);
		userRepository.update.mockResolvedValue({ id: 1 });

		await useCase.execute(1, { advertising_ids: [1, 1, 1] });

		expect(userRepository.countAdvertising).toHaveBeenCalledWith([1]);
		expect(userRepository.update).toHaveBeenCalledWith(1, { advertising_ids: [1] });
	});

	// 빈 배열은 "아무것도 못 봄"이라는 유효한 값이라 0 === 0으로 검증을 통과해야 한다
	it('빈 배열을 주면 허용 목록을 비운다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1 });
		userRepository.countAdvertising.mockResolvedValue(0);
		userRepository.update.mockResolvedValue({ id: 1 });

		await useCase.execute(1, { advertising_ids: [] });

		expect(userRepository.update).toHaveBeenCalledWith(1, { advertising_ids: [] });
	});

	it('존재하지 않는 광고 id가 섞이면 NotFoundException을 던진다', async () => {
		userRepository.findById.mockResolvedValue({ id: 1 });
		userRepository.countAdvertising.mockResolvedValue(1);

		await expect(useCase.execute(1, { advertising_ids: [1, 999] })).rejects.toThrow(NotFoundException);
		expect(userRepository.update).not.toHaveBeenCalled();
	});
});
