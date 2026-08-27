import { Test } from '@nestjs/testing';
import { ListInstallPostbacksUseCase } from './list-install-postbacks.use-case';
import { POSTBACK_REPOSITORY } from '@postback/domain/postback.repository';
import { CAMPAIGN_REPOSITORY } from '@postback/domain/campaign.repository';
import { viewCodeCodec } from '@common/utils/view-code.util';

describe('ListInstallPostbacksUseCase', () => {
	const postbackRepository = { findInstalls: jest.fn() };
	const campaignRepository = { findByToken: jest.fn() };
	let useCase: ListInstallPostbacksUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [
				ListInstallPostbacksUseCase,
				{ provide: POSTBACK_REPOSITORY, useValue: postbackRepository },
				{ provide: CAMPAIGN_REPOSITORY, useValue: campaignRepository },
			],
		}).compile();
		useCase = module.get(ListInstallPostbacksUseCase);
	});

	it('KST 일자 경계(end exclusive)로 변환해 repository에 넘긴다', async () => {
		const rows = [{ event_name: 'install' }];
		postbackRepository.findInstalls.mockResolvedValue(rows);

		expect(await useCase.execute({ token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' }, undefined)).toBe(rows);
		expect(postbackRepository.findInstalls).toHaveBeenCalledWith({
			token: 'tok',
			view_code: undefined,
			start: new Date('2026-06-30T15:00:00.000Z'), // 2026-07-01 00:00 KST
			end: new Date('2026-07-10T15:00:00.000Z'), // 2026-07-11 00:00 KST
		});
	});

	it('view_code가 주어지면 그대로 필터에 넘긴다', async () => {
		postbackRepository.findInstalls.mockResolvedValue([]);

		await useCase.execute({ view_code: 'vc1', start_date: '2026-07-01', end_date: '2026-07-01' }, undefined);

		expect(postbackRepository.findInstalls).toHaveBeenCalledWith(expect.objectContaining({ token: undefined, view_code: 'vc1' }));
	});

	it('스코프가 undefined면(면제) campaign을 조회하지 않는다', async () => {
		postbackRepository.findInstalls.mockResolvedValue([]);

		await useCase.execute({ token: 'tok', start_date: '2026-07-01', end_date: '2026-07-01' }, undefined);

		expect(campaignRepository.findByToken).not.toHaveBeenCalled();
	});

	it('token의 캠페인이 허용 광고면 조회한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({ advertising_id: 1 });
		postbackRepository.findInstalls.mockResolvedValue([]);

		await useCase.execute({ token: 'tok', start_date: '2026-07-01', end_date: '2026-07-01' }, [1]);

		expect(campaignRepository.findByToken).toHaveBeenCalledWith('tok');
		expect(postbackRepository.findInstalls).toHaveBeenCalled();
	});

	it('token 없이 view_code만 오면 복호화해 token을 복원하고, 조회에는 원래 dto 값을 넘긴다', async () => {
		const viewCode = viewCodeCodec.encode('tok:pub1:sub1');
		campaignRepository.findByToken.mockResolvedValue({ advertising_id: 1 });
		postbackRepository.findInstalls.mockResolvedValue([]);

		await useCase.execute({ view_code: viewCode, start_date: '2026-07-01', end_date: '2026-07-01' }, [1]);

		expect(campaignRepository.findByToken).toHaveBeenCalledWith('tok');
		// 복원한 token이 아니라 원래 dto.token(undefined)을 넘겨 view_code 단독 조회의 기존 동작을 유지한다
		expect(postbackRepository.findInstalls).toHaveBeenCalledWith(expect.objectContaining({ token: undefined, view_code: viewCode }));
	});

	it('캠페인이 없으면 빈 배열을 반환한다', async () => {
		campaignRepository.findByToken.mockResolvedValue(null);

		expect(await useCase.execute({ token: 'tok', start_date: '2026-07-01', end_date: '2026-07-01' }, [1])).toEqual([]);
		expect(postbackRepository.findInstalls).not.toHaveBeenCalled();
	});

	it('허용 광고 밖이면 빈 배열을 반환한다', async () => {
		campaignRepository.findByToken.mockResolvedValue({ advertising_id: 2 });

		expect(await useCase.execute({ token: 'tok', start_date: '2026-07-01', end_date: '2026-07-01' }, [1])).toEqual([]);
		expect(postbackRepository.findInstalls).not.toHaveBeenCalled();
	});
});
