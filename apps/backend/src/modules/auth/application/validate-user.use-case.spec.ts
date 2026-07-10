import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ValidateUserUseCase } from './validate-user.use-case';
import { FindUserUseCase } from '@user/application/find-user.use-case';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('ValidateUserUseCase', () => {
	const findUserUseCase = { execute: jest.fn() } as unknown as FindUserUseCase;
	let useCase: ValidateUserUseCase;

	const user = { id: 1, user_id: 'admin', password: 'hashed', role: 'ADMIN' };

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [ValidateUserUseCase, { provide: FindUserUseCase, useValue: findUserUseCase }],
		}).compile();

		useCase = module.get(ValidateUserUseCase);
	});

	it('비밀번호가 일치하면 password를 제외한 프로필을 반환한다', async () => {
		(findUserUseCase.execute as jest.Mock).mockResolvedValue(user);
		mockedBcrypt.compare.mockResolvedValue(true as never);

		const result = await useCase.execute('admin', 'pw1234');

		expect(result).toEqual({ id: 1, user_id: 'admin', role: 'ADMIN' });
		expect(result).not.toHaveProperty('password');
	});

	it('user가 없으면 null을 반환한다', async () => {
		(findUserUseCase.execute as jest.Mock).mockResolvedValue(null);

		expect(await useCase.execute('none', 'pw')).toBeNull();
	});

	it('비밀번호가 불일치하면 null을 반환한다', async () => {
		(findUserUseCase.execute as jest.Mock).mockResolvedValue(user);
		mockedBcrypt.compare.mockResolvedValue(false as never);

		expect(await useCase.execute('admin', 'wrong')).toBeNull();
	});
});
