// CampaignController가 각 동작을 대응 use-case에 위임하는지 검증
import { CampaignController } from './campaign.controller';
import { CreateCampaignUseCase } from '@campaign/application/create-campaign.use-case';
import { DeleteCampaignUseCase } from '@campaign/application/delete-campaign.use-case';
import { ToggleCampaignUseCase } from '@campaign/application/toggle-campaign.use-case';
import { GetCampaignUseCase } from '@campaign/application/get-campaign.use-case';
import { ListConfigUseCase } from '@campaign/application/list-config.use-case';
import { ReplaceConfigUseCase } from '@campaign/application/replace-config.use-case';
import { CreateCampaignDto } from '@campaign/application/dto/create-campaign.dto';
import { ReplaceConfigDto } from '@campaign/application/dto/replace-config.dto';

describe('CampaignController', () => {
	const createCampaignUseCase = { execute: jest.fn() } as unknown as CreateCampaignUseCase;
	const deleteCampaignUseCase = { execute: jest.fn() } as unknown as DeleteCampaignUseCase;
	const toggleCampaignUseCase = { execute: jest.fn() } as unknown as ToggleCampaignUseCase;
	const getCampaignUseCase = { execute: jest.fn() } as unknown as GetCampaignUseCase;
	const listConfigUseCase = { execute: jest.fn() } as unknown as ListConfigUseCase;
	const replaceConfigUseCase = { execute: jest.fn() } as unknown as ReplaceConfigUseCase;
	const controller = new CampaignController(
		createCampaignUseCase,
		deleteCampaignUseCase,
		toggleCampaignUseCase,
		getCampaignUseCase,
		listConfigUseCase,
		replaceConfigUseCase
	);

	beforeEach(() => jest.clearAllMocks());

	it('create는 생성 use-case에 body를 위임한다', async () => {
		const body: CreateCampaignDto = { name: 'c', type: 'CPI', advertising_id: 5, media_id: 2 };
		const created = { id: 10 };
		(createCampaignUseCase.execute as jest.Mock).mockResolvedValue(created);

		expect(await controller.create(body)).toBe(created);
		expect(createCampaignUseCase.execute).toHaveBeenCalledWith(body);
	});

	it('delete는 삭제 use-case에 id를 위임한다', async () => {
		await controller.delete({ id: 10 });
		expect(deleteCampaignUseCase.execute).toHaveBeenCalledWith(10);
	});

	it('toggle는 토글 use-case에 id를 위임한다', async () => {
		await controller.toggle({ id: 10 });
		expect(toggleCampaignUseCase.execute).toHaveBeenCalledWith(10);
	});

	it('get은 조회 use-case 결과를 반환한다', async () => {
		const campaign = { id: 10 };
		(getCampaignUseCase.execute as jest.Mock).mockResolvedValue(campaign);

		expect(await controller.get({ id: 10 })).toBe(campaign);
		expect(getCampaignUseCase.execute).toHaveBeenCalledWith(10);
	});

	it('getConfigs는 config 목록 use-case 결과를 반환한다', async () => {
		const configs = [{ id: 1 }];
		(listConfigUseCase.execute as jest.Mock).mockResolvedValue(configs);

		expect(await controller.getConfigs({ id: 10 })).toBe(configs);
		expect(listConfigUseCase.execute).toHaveBeenCalledWith(10);
	});

	it('replaceConfigs는 교체 use-case에 id·body를 위임한다', async () => {
		const body: ReplaceConfigDto[] = [{ tracker_event_name: 'install', admin_event_name: 'install', media_event_name: 'install', send_media: true }];

		await controller.replaceConfigs({ id: 10 }, body);

		expect(replaceConfigUseCase.execute).toHaveBeenCalledWith(10, body);
	});
});
