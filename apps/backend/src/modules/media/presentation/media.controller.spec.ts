// MediaController가 목록 조회를 use-case에 위임하는지 검증
import { MediaController } from './media.controller';
import { ListMediaUseCase } from '@media/application/list-media.use-case';

describe('MediaController', () => {
	const listMediaUseCase = { execute: jest.fn() } as unknown as ListMediaUseCase;
	const controller = new MediaController(listMediaUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('getMedia는 목록 use-case 결과를 반환한다', async () => {
		const list = [{ id: 1, name: 'm1', install_postback_url: 'i1', event_postback_url: 'e1', campaign: 2 }];
		(listMediaUseCase.execute as jest.Mock).mockResolvedValue(list);

		expect(await controller.getMedia()).toBe(list);
	});
});
