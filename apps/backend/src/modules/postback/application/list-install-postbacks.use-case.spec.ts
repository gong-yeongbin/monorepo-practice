import { Test } from '@nestjs/testing';
import { ListInstallPostbacksUseCase } from './list-install-postbacks.use-case';
import { POSTBACK_REPOSITORY } from '@postback/domain/postback.repository';

describe('ListInstallPostbacksUseCase', () => {
	const postbackRepository = { findInstalls: jest.fn() };
	let useCase: ListInstallPostbacksUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [ListInstallPostbacksUseCase, { provide: POSTBACK_REPOSITORY, useValue: postbackRepository }],
		}).compile();
		useCase = module.get(ListInstallPostbacksUseCase);
	});

	it('KST 일자 경계(end exclusive)로 변환해 repository에 넘긴다', async () => {
		const rows = [{ event_name: 'install' }];
		postbackRepository.findInstalls.mockResolvedValue(rows);

		expect(await useCase.execute({ token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' })).toBe(rows);
		expect(postbackRepository.findInstalls).toHaveBeenCalledWith({
			token: 'tok',
			view_code: undefined,
			start: new Date('2026-06-30T15:00:00.000Z'), // 2026-07-01 00:00 KST
			end: new Date('2026-07-10T15:00:00.000Z'), // 2026-07-11 00:00 KST
		});
	});

	it('view_code가 주어지면 그대로 필터에 넘긴다', async () => {
		postbackRepository.findInstalls.mockResolvedValue([]);

		await useCase.execute({ view_code: 'vc1', start_date: '2026-07-01', end_date: '2026-07-01' });

		expect(postbackRepository.findInstalls).toHaveBeenCalledWith(expect.objectContaining({ token: undefined, view_code: 'vc1' }));
	});
});
