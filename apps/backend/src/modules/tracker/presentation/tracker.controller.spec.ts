// TrackerController가 각 라우트를 대응 use-case에 위임하는지 검증
import { TrackerController } from './tracker.controller';
import { ListTrackerUseCase } from '@tracker/application/list-tracker.use-case';
import { GetTrackerUseCase } from '@tracker/application/get-tracker.use-case';
import { CreateTrackerUseCase } from '@tracker/application/create-tracker.use-case';
import { UpdateTrackerUseCase } from '@tracker/application/update-tracker.use-case';
import { DeleteTrackerUseCase } from '@tracker/application/delete-tracker.use-case';

describe('TrackerController', () => {
	const listTrackerUseCase = { execute: jest.fn() } as unknown as ListTrackerUseCase;
	const getTrackerUseCase = { execute: jest.fn() } as unknown as GetTrackerUseCase;
	const createTrackerUseCase = { execute: jest.fn() } as unknown as CreateTrackerUseCase;
	const updateTrackerUseCase = { execute: jest.fn() } as unknown as UpdateTrackerUseCase;
	const deleteTrackerUseCase = { execute: jest.fn() } as unknown as DeleteTrackerUseCase;
	const controller = new TrackerController(listTrackerUseCase, getTrackerUseCase, createTrackerUseCase, updateTrackerUseCase, deleteTrackerUseCase);

	const body = { name: 'appsflyer', tracking_url: 't', install_postback_url: 'i', event_postback_url: 'e' };

	beforeEach(() => jest.clearAllMocks());

	it('list는 목록 use-case 결과를 반환한다', async () => {
		const list = [{ id: 1, ...body }];
		(listTrackerUseCase.execute as jest.Mock).mockResolvedValue(list);

		expect(await controller.list()).toBe(list);
	});

	it('get은 단건 use-case에 id를 위임한다', async () => {
		(getTrackerUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, ...body });

		expect(await controller.get({ id: 1 })).toEqual({ id: 1, ...body });
		expect(getTrackerUseCase.execute).toHaveBeenCalledWith(1);
	});

	it('create는 생성 use-case에 body를 위임한다', async () => {
		(createTrackerUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, ...body });

		expect(await controller.create(body)).toEqual({ id: 1, ...body });
		expect(createTrackerUseCase.execute).toHaveBeenCalledWith(body);
	});

	it('update는 수정 use-case에 id와 body를 위임한다', async () => {
		(updateTrackerUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, ...body });

		await controller.update({ id: 1 }, body);
		expect(updateTrackerUseCase.execute).toHaveBeenCalledWith(1, body);
	});

	it('delete는 삭제 use-case에 id를 위임한다', async () => {
		await controller.delete({ id: 1 });
		expect(deleteTrackerUseCase.execute).toHaveBeenCalledWith(1);
	});
});
