// AuthController가 각 라우트를 대응 use-case에 위임하는지 검증
import { AuthController } from './auth.controller';
import { RequestSignupUseCase } from '@auth/application/request-signup.use-case';
import { VerifySignupUseCase } from '@auth/application/verify-signup.use-case';

describe('AuthController', () => {
	const requestSignupUseCase = { execute: jest.fn() } as unknown as RequestSignupUseCase;
	const verifySignupUseCase = { execute: jest.fn() } as unknown as VerifySignupUseCase;
	const controller = new AuthController(requestSignupUseCase, verifySignupUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('requestSignup은 신청 use-case에 email·password를 위임한다', async () => {
		await controller.requestSignup({ email: 'new@example.com', password: 'password123' });
		expect(requestSignupUseCase.execute).toHaveBeenCalledWith('new@example.com', 'password123');
	});

	it('verifySignup은 확정 use-case에 email·code를 위임한다', async () => {
		await controller.verifySignup({ email: 'new@example.com', code: '123456' });
		expect(verifySignupUseCase.execute).toHaveBeenCalledWith('new@example.com', '123456');
	});
});
