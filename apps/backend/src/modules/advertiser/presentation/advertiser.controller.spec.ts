// AdvertiserController가 각 라우트를 대응 use-case에 위임하는지 검증
import { AdvertiserController } from './advertiser.controller';
import { ListAdvertiserUseCase } from '@advertiser/application/list-advertiser.use-case';
import { GetAdvertiserUseCase } from '@advertiser/application/get-advertiser.use-case';
import { CreateAdvertiserUseCase } from '@advertiser/application/create-advertiser.use-case';
import { UpdateAdvertiserUseCase } from '@advertiser/application/update-advertiser.use-case';
import { DeleteAdvertiserUseCase } from '@advertiser/application/delete-advertiser.use-case';

describe('AdvertiserController', () => {
	const listAdvertiserUseCase = { execute: jest.fn() } as unknown as ListAdvertiserUseCase;
	const getAdvertiserUseCase = { execute: jest.fn() } as unknown as GetAdvertiserUseCase;
	const createAdvertiserUseCase = { execute: jest.fn() } as unknown as CreateAdvertiserUseCase;
	const updateAdvertiserUseCase = { execute: jest.fn() } as unknown as UpdateAdvertiserUseCase;
	const deleteAdvertiserUseCase = { execute: jest.fn() } as unknown as DeleteAdvertiserUseCase;
	const controller = new AdvertiserController(listAdvertiserUseCase, getAdvertiserUseCase, createAdvertiserUseCase, updateAdvertiserUseCase, deleteAdvertiserUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('list는 목록 use-case 결과를 반환한다', async () => {
		const list = [{ id: 1, name: 'a' }];
		(listAdvertiserUseCase.execute as jest.Mock).mockResolvedValue(list);

		expect(await controller.list()).toBe(list);
	});

	it('get은 단건 use-case에 id를 위임한다', async () => {
		(getAdvertiserUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, name: 'a' });

		expect(await controller.get({ id: 1 })).toEqual({ id: 1, name: 'a' });
		expect(getAdvertiserUseCase.execute).toHaveBeenCalledWith(1);
	});

	it('create는 생성 use-case에 body를 위임한다', async () => {
		const created = { id: 1, name: 'a' };
		(createAdvertiserUseCase.execute as jest.Mock).mockResolvedValue(created);

		const result = await controller.create({ name: 'a' });

		expect(createAdvertiserUseCase.execute).toHaveBeenCalledWith({ name: 'a' });
		expect(result).toBe(created);
	});

	it('update는 수정 use-case에 id와 body를 위임한다', async () => {
		(updateAdvertiserUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, name: 'b' });

		await controller.update({ id: 1 }, { name: 'b' });
		expect(updateAdvertiserUseCase.execute).toHaveBeenCalledWith(1, { name: 'b' });
	});

	it('delete는 삭제 use-case에 id를 위임한다', async () => {
		await controller.delete({ id: 1 });
		expect(deleteAdvertiserUseCase.execute).toHaveBeenCalledWith(1);
	});
});
