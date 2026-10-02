// LoginHistoryController가 목록 조회를 use-case에 위임하는지 검증
import { LoginHistoryController } from './login-history.controller';
import { ListLoginHistoryUseCase } from '@auth/application/list-login-history.use-case';

describe('LoginHistoryController', () => {
	const listLoginHistoryUseCase = { execute: jest.fn() } as unknown as ListLoginHistoryUseCase;
	const controller = new LoginHistoryController(listLoginHistoryUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('list는 쿼리를 그대로 use-case에 위임하고 페이지를 반환한다', async () => {
		const page = { items: [], total: 0 };
		(listLoginHistoryUseCase.execute as jest.Mock).mockResolvedValue(page);

		expect(await controller.list({ user_id: 1, offset: 0, limit: 20 })).toEqual(page);
		expect(listLoginHistoryUseCase.execute).toHaveBeenCalledWith({ user_id: 1, offset: 0, limit: 20 });
	});
});
