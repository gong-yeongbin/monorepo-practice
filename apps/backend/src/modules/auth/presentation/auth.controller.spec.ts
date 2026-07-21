// AuthController가 각 라우트를 대응 use-case에 위임하는지 검증
import { AuthController } from './auth.controller';
import { SignupUseCase } from '@auth/application/signup.use-case';
import { VerifyUseCase } from '@auth/application/verify.use-case';

describe('AuthController', () => {
	const signupUseCase = { execute: jest.fn() } as unknown as SignupUseCase;
	const verifyUseCase = { execute: jest.fn() } as unknown as VerifyUseCase;
	const controller = new AuthController(signupUseCase, verifyUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('signup은 신청 use-case에 email·password를 위임한다', async () => {
		await controller.signup({ email: 'new@example.com', password: 'password123' });
		expect(signupUseCase.execute).toHaveBeenCalledWith('new@example.com', 'password123');
	});

	it('verify는 확정 use-case에 email·code를 위임한다', async () => {
		await controller.verify({ email: 'new@example.com', code: '123456' });
		expect(verifyUseCase.execute).toHaveBeenCalledWith('new@example.com', '123456');
	});
});
