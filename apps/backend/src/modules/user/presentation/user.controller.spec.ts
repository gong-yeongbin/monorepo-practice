// UserController가 user 생성을 use-case에 위임하는지 검증
import { UserController } from './user.controller';
import { CreateUserUseCase } from '@user/application/create-user.use-case';
import { CreateUserDto } from '@user/application/dto/create-user.dto';

describe('UserController', () => {
	const createUserUseCase = { execute: jest.fn() } as unknown as CreateUserUseCase;
	const controller = new UserController(createUserUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('addUser는 create use-case에 body를 위임한다', async () => {
		const body: CreateUserDto = { user_id: 'admin', password: 'pw1234', role: 'ADMIN' };

		await controller.addUser(body);

		expect(createUserUseCase.execute).toHaveBeenCalledWith(body);
	});
});
