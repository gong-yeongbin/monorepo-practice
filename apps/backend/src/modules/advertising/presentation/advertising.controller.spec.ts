// AdvertisingController가 각 라우트를 대응 use-case에 위임하는지 검증
import { AdvertisingController } from './advertising.controller';
import { CreateAdvertisingUseCase } from '@advertising/application/create-advertising.use-case';
import { ListAdvertisingUseCase } from '@advertising/application/list-advertising.use-case';
import { GetAdvertisingUseCase } from '@advertising/application/get-advertising.use-case';
import { UpdateAdvertisingUseCase } from '@advertising/application/update-advertising.use-case';
import { DeleteAdvertisingUseCase } from '@advertising/application/delete-advertising.use-case';

describe('AdvertisingController', () => {
	const create = { execute: jest.fn() } as unknown as CreateAdvertisingUseCase;
	const list = { execute: jest.fn() } as unknown as ListAdvertisingUseCase;
	const get = { execute: jest.fn() } as unknown as GetAdvertisingUseCase;
	const update = { execute: jest.fn() } as unknown as UpdateAdvertisingUseCase;
	const remove = { execute: jest.fn() } as unknown as DeleteAdvertisingUseCase;
	const controller = new AdvertisingController(create, list, get, update, remove);

	beforeEach(() => jest.clearAllMocks());

	it('create는 생성 use-case에 body를 위임한다', async () => {
		const body = { name: 'ad', advertiser_id: 1, tracker_id: 2 };
		(create.execute as jest.Mock).mockResolvedValue({ id: 5 });
		expect(await controller.create(body)).toEqual({ id: 5 });
		expect(create.execute).toHaveBeenCalledWith(body);
	});

	it('list는 목록 use-case에 query를 위임한다', async () => {
		const query = { search: 'a', offset: 0, limit: 20 };
		(list.execute as jest.Mock).mockResolvedValue([]);
		await controller.list(query);
		expect(list.execute).toHaveBeenCalledWith(query);
	});

	it('get은 조회 use-case에 id를 위임한다', async () => {
		(get.execute as jest.Mock).mockResolvedValue({});
		await controller.get({ id: 1 });
		expect(get.execute).toHaveBeenCalledWith(1);
	});

	it('update는 수정 use-case에 id와 body를 위임한다', async () => {
		const body = { name: 'ad', advertiser_id: 1, tracker_id: 2 };
		(update.execute as jest.Mock).mockResolvedValue({ id: 1 });
		expect(await controller.update({ id: 1 }, body)).toEqual({ id: 1 });
		expect(update.execute).toHaveBeenCalledWith(1, body);
	});

	it('delete는 삭제 use-case에 id를 위임한다', async () => {
		await controller.delete({ id: 1 });
		expect(remove.execute).toHaveBeenCalledWith(1);
	});
});
