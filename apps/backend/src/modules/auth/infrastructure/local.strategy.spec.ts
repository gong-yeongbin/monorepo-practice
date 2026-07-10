import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { ValidateUserUseCase } from '@auth/application/validate-user.use-case';

describe('LocalStrategy', () => {
	const validateUserUseCase = { execute: jest.fn() } as unknown as ValidateUserUseCase;
	const strategy = new LocalStrategy(validateUserUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('자격이 유효하면 검증된 사용자를 반환한다', async () => {
		const user = { id: 1, user_id: 'admin', role: 'ADMIN' };
		(validateUserUseCase.execute as jest.Mock).mockResolvedValue(user);

		const result = await strategy.validate('admin', 'pw1234');

		expect(result).toBe(user);
		expect(validateUserUseCase.execute).toHaveBeenCalledWith('admin', 'pw1234');
	});

	it('자격이 무효면 UnauthorizedException을 던진다', async () => {
		(validateUserUseCase.execute as jest.Mock).mockResolvedValue(null);

		await expect(strategy.validate('admin', 'wrong')).rejects.toThrow(UnauthorizedException);
	});
});
