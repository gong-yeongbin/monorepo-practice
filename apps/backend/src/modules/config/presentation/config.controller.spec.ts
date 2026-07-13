// ConfigController가 각 동작을 대응 use-case에 위임하는지 검증
import { ConfigController } from './config.controller';
import { ListConfigUseCase } from '@config/application/list-config.use-case';
import { ReplaceConfigUseCase } from '@config/application/replace-config.use-case';
import { ReplaceConfigDto } from '@config/application/dto/replace-config.dto';

describe('ConfigController', () => {
	const listConfigUseCase = { execute: jest.fn() } as unknown as ListConfigUseCase;
	const replaceConfigUseCase = { execute: jest.fn() } as unknown as ReplaceConfigUseCase;
	const controller = new ConfigController(listConfigUseCase, replaceConfigUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('list는 config 목록 use-case 결과를 반환한다', async () => {
		const configs = [{ id: 1 }];
		(listConfigUseCase.execute as jest.Mock).mockResolvedValue(configs);

		expect(await controller.list({ campaignId: 10 })).toBe(configs);
		expect(listConfigUseCase.execute).toHaveBeenCalledWith(10);
	});

	it('replace는 교체 use-case에 campaignId·body를 위임한다', async () => {
		const body: ReplaceConfigDto[] = [{ tracker_event_name: 'install', admin_event_name: 'install', media_event_name: 'install', send_media: true }];

		await controller.replace({ campaignId: 10 }, body);

		expect(replaceConfigUseCase.execute).toHaveBeenCalledWith(10, body);
	});
});
