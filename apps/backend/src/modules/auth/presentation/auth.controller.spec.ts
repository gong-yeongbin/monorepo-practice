// AuthController가 로그인·프로필 조회를 use-case에 위임하는지 검증
import { Request } from 'express';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '@auth/application/login.use-case';
import { GetProfileUseCase, Profile } from '@user/application/get-profile.use-case';

describe('AuthController', () => {
	const loginUseCase = { execute: jest.fn() } as unknown as LoginUseCase;
	const getProfileUseCase = { execute: jest.fn() } as unknown as GetProfileUseCase;
	const controller = new AuthController(loginUseCase, getProfileUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('login은 request.user로 로그인 use-case를 호출한다', async () => {
		const user: Profile = { id: 1, user_id: 'admin', role: 'ADMIN' };
		(loginUseCase.execute as jest.Mock).mockResolvedValue({ accessToken: 'token' });

		const result = await controller.login({ user } as unknown as Request);

		expect(loginUseCase.execute).toHaveBeenCalledWith(user);
		expect(result).toEqual({ accessToken: 'token' });
	});

	it('getProfile은 request.user의 user_id로 프로필을 조회한다', async () => {
		const profile: Profile = { id: 1, user_id: 'admin', role: 'ADMIN' };
		(getProfileUseCase.execute as jest.Mock).mockResolvedValue(profile);

		const result = await controller.getProfile({ user: { user_id: 'admin', role: 'ADMIN' } } as unknown as Request);

		expect(getProfileUseCase.execute).toHaveBeenCalledWith('admin');
		expect(result).toBe(profile);
	});
});
