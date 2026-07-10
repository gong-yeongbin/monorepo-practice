// AdvertiserController가 목록·생성을 use-case에 위임하는지 검증
import { AdvertiserController } from './advertiser.controller';
import { ListAdvertiserUseCase } from '@advertiser/application/list-advertiser.use-case';
import { CreateAdvertiserUseCase } from '@advertiser/application/create-advertiser.use-case';

describe('AdvertiserController', () => {
	const listAdvertiserUseCase = { execute: jest.fn() } as unknown as ListAdvertiserUseCase;
	const createAdvertiserUseCase = { execute: jest.fn() } as unknown as CreateAdvertiserUseCase;
	const controller = new AdvertiserController(listAdvertiserUseCase, createAdvertiserUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('get은 목록 use-case 결과를 반환한다', async () => {
		const list = [{ id: 1, name: 'a' }];
		(listAdvertiserUseCase.execute as jest.Mock).mockResolvedValue(list);

		expect(await controller.get()).toBe(list);
	});

	it('create는 생성 use-case에 body를 위임한다', async () => {
		const created = { id: 1, name: 'a' };
		(createAdvertiserUseCase.execute as jest.Mock).mockResolvedValue(created);

		const result = await controller.create({ name: 'a' });

		expect(createAdvertiserUseCase.execute).toHaveBeenCalledWith({ name: 'a' });
		expect(result).toBe(created);
	});
});
