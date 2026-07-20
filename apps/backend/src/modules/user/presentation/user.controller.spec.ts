// UserController가 각 라우트를 대응 use-case에 위임하는지 검증
import { UserController } from './user.controller';
import { RequestSignupUseCase } from '@user/application/request-signup.use-case';
import { VerifySignupUseCase } from '@user/application/verify-signup.use-case';
import { ListUserUseCase } from '@user/application/list-user.use-case';
import { GetUserUseCase } from '@user/application/get-user.use-case';
import { UpdateUserUseCase } from '@user/application/update-user.use-case';
import { DeleteUserUseCase } from '@user/application/delete-user.use-case';

describe('UserController', () => {
	const requestSignupUseCase = { execute: jest.fn() } as unknown as RequestSignupUseCase;
	const verifySignupUseCase = { execute: jest.fn() } as unknown as VerifySignupUseCase;
	const listUserUseCase = { execute: jest.fn() } as unknown as ListUserUseCase;
	const getUserUseCase = { execute: jest.fn() } as unknown as GetUserUseCase;
	const updateUserUseCase = { execute: jest.fn() } as unknown as UpdateUserUseCase;
	const deleteUserUseCase = { execute: jest.fn() } as unknown as DeleteUserUseCase;
	const controller = new UserController(requestSignupUseCase, verifySignupUseCase, listUserUseCase, getUserUseCase, updateUserUseCase, deleteUserUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('requestSignup은 신청 use-case에 email·password를 위임한다', async () => {
		await controller.requestSignup({ email: 'new@example.com', password: 'password123' });
		expect(requestSignupUseCase.execute).toHaveBeenCalledWith('new@example.com', 'password123');
	});

	it('verifySignup은 확정 use-case에 email·code를 위임한다', async () => {
		await controller.verifySignup({ email: 'new@example.com', code: '123456' });
		expect(verifySignupUseCase.execute).toHaveBeenCalledWith('new@example.com', '123456');
	});

	it('list는 목록 use-case 결과를 반환한다', async () => {
		const list = [{ id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true }];
		(listUserUseCase.execute as jest.Mock).mockResolvedValue(list);

		expect(await controller.list()).toBe(list);
	});

	it('get은 단건 use-case에 id를 위임한다', async () => {
		const user = { id: 1, email: 'admin@example.com', role: 'ADMIN', approved: true };
		(getUserUseCase.execute as jest.Mock).mockResolvedValue(user);

		expect(await controller.get({ id: 1 })).toBe(user);
		expect(getUserUseCase.execute).toHaveBeenCalledWith(1);
	});

	it('update는 수정 use-case에 id와 body를 위임한다', async () => {
		(updateUserUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, email: 'admin@example.com', role: 'MEDIA', approved: true });

		await controller.update({ id: 1 }, { role: 'MEDIA', approved: true });
		expect(updateUserUseCase.execute).toHaveBeenCalledWith(1, { role: 'MEDIA', approved: true });
	});

	it('delete는 삭제 use-case에 id를 위임한다', async () => {
		await controller.delete({ id: 1 });
		expect(deleteUserUseCase.execute).toHaveBeenCalledWith(1);
	});
});
