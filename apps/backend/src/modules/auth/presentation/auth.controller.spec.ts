// AuthController가 각 라우트를 대응 use-case에 위임하는지 검증
import { AuthController } from './auth.controller';
import { SignupUseCase } from '@auth/application/signup.use-case';
import { VerifyUseCase } from '@auth/application/verify.use-case';
import { SigninUseCase } from '@auth/application/signin.use-case';
import { RefreshUseCase } from '@auth/application/refresh.use-case';
import { CheckEmailAvailabilityUseCase } from '@auth/application/check-email-availability.use-case';

describe('AuthController', () => {
	const signupUseCase = { execute: jest.fn() } as unknown as SignupUseCase;
	const verifyUseCase = { execute: jest.fn() } as unknown as VerifyUseCase;
	const signinUseCase = { execute: jest.fn() } as unknown as SigninUseCase;
	const refreshUseCase = { execute: jest.fn() } as unknown as RefreshUseCase;
	const checkEmailAvailabilityUseCase = { execute: jest.fn() } as unknown as CheckEmailAvailabilityUseCase;
	const controller = new AuthController(signupUseCase, verifyUseCase, signinUseCase, refreshUseCase, checkEmailAvailabilityUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('emailAvailability는 조회 use-case에 email을 위임하고 결과를 반환한다', async () => {
		(checkEmailAvailabilityUseCase.execute as jest.Mock).mockResolvedValue({ available: true });

		expect(await controller.emailAvailability({ email: 'new@example.com' })).toEqual({ available: true });
		expect(checkEmailAvailabilityUseCase.execute).toHaveBeenCalledWith('new@example.com');
	});

	it('signup은 신청 use-case에 email·password를 위임한다', async () => {
		await controller.signup({ email: 'new@example.com', password: 'password123' });
		expect(signupUseCase.execute).toHaveBeenCalledWith('new@example.com', 'password123');
	});

	it('verify는 확정 use-case에 email·code를 위임한다', async () => {
		await controller.verify({ email: 'new@example.com', code: '123456' });
		expect(verifyUseCase.execute).toHaveBeenCalledWith('new@example.com', '123456');
	});

	it('signin은 로그인 use-case에 email·password를 위임하고 토큰 응답을 반환한다', async () => {
		const tokens = { access_token: 'access-token', refresh_token: 'refresh-token' };
		(signinUseCase.execute as jest.Mock).mockResolvedValue(tokens);

		expect(await controller.signin({ email: 'user@example.com', password: 'password123' })).toEqual(tokens);
		expect(signinUseCase.execute).toHaveBeenCalledWith('user@example.com', 'password123');
	});

	it('refresh는 재발급 use-case에 refresh_token을 위임하고 access 응답을 반환한다', async () => {
		(refreshUseCase.execute as jest.Mock).mockResolvedValue({ access_token: 'new-access-token' });

		expect(await controller.refresh({ refresh_token: 'refresh-token' })).toEqual({ access_token: 'new-access-token' });
		expect(refreshUseCase.execute).toHaveBeenCalledWith('refresh-token');
	});
});
