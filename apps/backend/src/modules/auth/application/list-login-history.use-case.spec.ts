// 조회 파라미터를 repository에 넘기고, 각 기록의 user_agent 원문을 브라우저·OS·기기 종류로 해석해 덧붙이는지 검증
import { Test } from '@nestjs/testing';
import { ListLoginHistoryUseCase } from './list-login-history.use-case';
import { LOGIN_HISTORY_REPOSITORY } from '@auth/domain/login-history.repository';

describe('ListLoginHistoryUseCase', () => {
	const loginHistoryRepository = { create: jest.fn(), list: jest.fn() };
	let useCase: ListLoginHistoryUseCase;

	const row = {
		id: 1,
		user_id: 1,
		email: 'user@example.com',
		result: 'SUCCESS' as const,
		ip: '203.0.113.10',
		user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
		created_at: new Date('2026-10-02T00:00:00Z'),
	};

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [ListLoginHistoryUseCase, { provide: LOGIN_HISTORY_REPOSITORY, useValue: loginHistoryRepository }],
		}).compile();
		useCase = module.get(ListLoginHistoryUseCase);
	});

	it('user_id·offset·limit을 repository에 넘기고 항목마다 해석한 브라우저·OS·기기 종류를 덧붙여 반환한다', async () => {
		loginHistoryRepository.list.mockResolvedValue({ items: [row], total: 1 });

		const result = await useCase.execute({ user_id: 1, offset: 0, limit: 20 });

		expect(loginHistoryRepository.list).toHaveBeenCalledWith({ user_id: 1, offset: 0, limit: 20 });
		expect(result).toEqual({ items: [{ ...row, browser: 'Chrome', os: 'macOS', device_type: 'desktop' }], total: 1 });
	});

	it('user_id를 생략하면 그대로 undefined로 넘겨 전체를 조회한다', async () => {
		loginHistoryRepository.list.mockResolvedValue({ items: [], total: 0 });

		expect(await useCase.execute({ offset: 40, limit: 20 })).toEqual({ items: [], total: 0 });
		expect(loginHistoryRepository.list).toHaveBeenCalledWith({ user_id: undefined, offset: 40, limit: 20 });
	});

	it('user_agent가 없는 기록은 브라우저·OS를 null로 돌려준다', async () => {
		loginHistoryRepository.list.mockResolvedValue({ items: [{ ...row, user_agent: null }], total: 1 });

		const result = await useCase.execute({ offset: 0, limit: 20 });

		expect(result.items[0]).toEqual({ ...row, user_agent: null, browser: null, os: null, device_type: 'unknown' });
	});
});
