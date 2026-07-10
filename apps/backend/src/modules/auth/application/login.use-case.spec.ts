import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.use-case';
import { Profile } from '@user/application/get-profile.use-case';

describe('LoginUseCase', () => {
	const jwtService = { signAsync: jest.fn() };
	let useCase: LoginUseCase;

	const user: Profile = { id: 1, user_id: 'admin', role: 'ADMIN' };

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [LoginUseCase, { provide: JwtService, useValue: jwtService }],
		}).compile();

		useCase = module.get(LoginUseCase);
	});

	it('user_id·role을 payload로 accessToken을 발급한다', async () => {
		jwtService.signAsync.mockResolvedValue('signed-token');

		const result = await useCase.execute(user);

		expect(jwtService.signAsync).toHaveBeenCalledWith({ user_id: 'admin', role: 'ADMIN' });
		expect(result).toEqual({ accessToken: 'signed-token' });
	});
});
