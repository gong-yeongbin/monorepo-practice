import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { GetProfileUseCase } from './get-profile.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

describe('GetProfileUseCase', () => {
	const userRepository = { findByUserId: jest.fn(), create: jest.fn() };
	let useCase: GetProfileUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [GetProfileUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();

		useCase = module.get(GetProfileUseCase);
	});

	it('user_id로 조회해 password를 제외한 프로필을 반환한다', async () => {
		userRepository.findByUserId.mockResolvedValue({ id: 1, user_id: 'admin', password: 'hashed', role: 'ADMIN' });

		const profile = await useCase.execute('admin');

		expect(profile).toEqual({ id: 1, user_id: 'admin', role: 'ADMIN' });
		expect(profile).not.toHaveProperty('password');
	});

	it('user가 없으면 UnauthorizedException을 던진다', async () => {
		userRepository.findByUserId.mockResolvedValue(null);

		await expect(useCase.execute('none')).rejects.toThrow(UnauthorizedException);
	});
});
