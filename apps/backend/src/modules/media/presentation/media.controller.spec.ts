// MediaController가 각 라우트를 대응 use-case에 위임하는지 검증
import { MediaController } from './media.controller';
import { ListMediaUseCase } from '@media/application/list-media.use-case';
import { GetMediaUseCase } from '@media/application/get-media.use-case';
import { CreateMediaUseCase } from '@media/application/create-media.use-case';
import { UpdateMediaUseCase } from '@media/application/update-media.use-case';
import { DeleteMediaUseCase } from '@media/application/delete-media.use-case';
import { ROLES_KEY } from '@auth/presentation/roles.decorator';

describe('MediaController', () => {
	const listMediaUseCase = { execute: jest.fn() } as unknown as ListMediaUseCase;
	const getMediaUseCase = { execute: jest.fn() } as unknown as GetMediaUseCase;
	const createMediaUseCase = { execute: jest.fn() } as unknown as CreateMediaUseCase;
	const updateMediaUseCase = { execute: jest.fn() } as unknown as UpdateMediaUseCase;
	const deleteMediaUseCase = { execute: jest.fn() } as unknown as DeleteMediaUseCase;
	const controller = new MediaController(listMediaUseCase, getMediaUseCase, createMediaUseCase, updateMediaUseCase, deleteMediaUseCase);

	const body = { name: 'm1', install_postback_url: 'i', event_postback_url: 'e' };

	beforeEach(() => jest.clearAllMocks());

	it('list는 목록 use-case 결과를 반환한다', async () => {
		const list = [{ id: 1, ...body, campaign: 2 }];
		(listMediaUseCase.execute as jest.Mock).mockResolvedValue(list);

		expect(await controller.list()).toBe(list);
	});

	it('get은 단건 use-case에 id를 위임한다', async () => {
		(getMediaUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, ...body });

		expect(await controller.get({ id: 1 })).toEqual({ id: 1, ...body });
		expect(getMediaUseCase.execute).toHaveBeenCalledWith(1);
	});

	it('create는 생성 use-case에 body를 위임한다', async () => {
		(createMediaUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, ...body });

		expect(await controller.create(body)).toEqual({ id: 1, ...body });
		expect(createMediaUseCase.execute).toHaveBeenCalledWith(body);
	});

	it('create는 DEVELOPER만 호출할 수 있다(클래스 기본값 ADMIN 이상을 메서드 레벨이 덮는다)', () => {
		expect(Reflect.getMetadata(ROLES_KEY, MediaController.prototype.create)).toEqual(['DEVELOPER']);
	});

	it('update는 수정 use-case에 id와 body를 위임한다', async () => {
		(updateMediaUseCase.execute as jest.Mock).mockResolvedValue({ id: 1, ...body });

		await controller.update({ id: 1 }, body);
		expect(updateMediaUseCase.execute).toHaveBeenCalledWith(1, body);
	});

	it('delete는 삭제 use-case에 id를 위임한다', async () => {
		await controller.delete({ id: 1 });
		expect(deleteMediaUseCase.execute).toHaveBeenCalledWith(1);
	});
});
