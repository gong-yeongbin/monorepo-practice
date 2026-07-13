// UserController가 각 라우트를 대응 use-case에 위임하는지 검증
import { UserController } from './user.controller';
import { CreateUserUseCase } from '@user/application/create-user.use-case';
import { ListUserUseCase } from '@user/application/list-user.use-case';
import { GetUserUseCase } from '@user/application/get-user.use-case';
import { UpdateUserUseCase } from '@user/application/update-user.use-case';
import { DeleteUserUseCase } from '@user/application/delete-user.use-case';
import { CreateUserDto } from '@user/application/dto/create-user.dto';

describe('UserController', () => {
	const createUserUseCase = { execute: jest.fn() } as unknown as CreateUserUseCase;
	const listUserUseCase = { execute: jest.fn() } as unknown as ListUserUseCase;
	const getUserUseCase = { execute: jest.fn() } as unknown as GetUserUseCase;
	const updateUserUseCase = { execute: jest.fn() } as unknown as UpdateUserUseCase;
	const deleteUserUseCase = { execute: jest.fn() } as unknown as DeleteUserUseCase;
	const controller = new UserController(createUserUseCase, listUserUseCase, getUserUseCase, updateUserUseCase, deleteUserUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('create는 create use-case에 body를 위임한다', async () => {
		const body: CreateUserDto = { user_id: 'admin', password: 'pw1234', role: 'ADMIN' };

		await controller.create(body);

		expect(createUserUseCase.execute).toHaveBeenCalledWith(body);
	});

	it('list는 목록 use-case 결과를 반환한다', async () => {
		const list = [{ id: 1, user_id: 'admin', role: 'ADMIN' }];
		(listUserUseCase.execute as jest.Mock).mockResolvedValue(list);

		expect(await controller.list()).toBe(list);
	});

	it('get은 단건 use-case에 id를 위임한다', async () => {
		(getUserUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, user_id: 'admin', role: 'ADMIN' });

		expect(await controller.get({ id: 1 })).toEqual({ id: 1, user_id: 'admin', role: 'ADMIN' });
		expect(getUserUseCase.execute).toHaveBeenCalledWith(1);
	});

	it('update는 수정 use-case에 id와 body를 위임한다', async () => {
		(updateUserUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, user_id: 'admin', role: 'MEDIA' });

		await controller.update({ id: 1 }, { role: 'MEDIA' });
		expect(updateUserUseCase.execute).toHaveBeenCalledWith(1, { role: 'MEDIA' });
	});

	it('delete는 삭제 use-case에 id를 위임한다', async () => {
		await controller.delete({ id: 1 });
		expect(deleteUserUseCase.execute).toHaveBeenCalledWith(1);
	});
});
