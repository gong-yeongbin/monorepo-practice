// CampaignController가 각 동작을 대응 use-case에 위임하는지 검증
import { CampaignController } from './campaign.controller';
import { CreateCampaignUseCase } from '@campaign/application/create-campaign.use-case';
import { DeleteCampaignUseCase } from '@campaign/application/delete-campaign.use-case';
import { UpdateCampaignUseCase } from '@campaign/application/update-campaign.use-case';
import { GetCampaignUseCase } from '@campaign/application/get-campaign.use-case';
import { ListCampaignUseCase } from '@campaign/application/list-campaign.use-case';
import { CreateCampaignDto } from '@campaign/application/dto/create-campaign.dto';

describe('CampaignController', () => {
	const createCampaignUseCase = { execute: jest.fn() } as unknown as CreateCampaignUseCase;
	const deleteCampaignUseCase = { execute: jest.fn() } as unknown as DeleteCampaignUseCase;
	const updateCampaignUseCase = { execute: jest.fn() } as unknown as UpdateCampaignUseCase;
	const getCampaignUseCase = { execute: jest.fn() } as unknown as GetCampaignUseCase;
	const listCampaignUseCase = { execute: jest.fn() } as unknown as ListCampaignUseCase;
	const controller = new CampaignController(createCampaignUseCase, deleteCampaignUseCase, updateCampaignUseCase, getCampaignUseCase, listCampaignUseCase);

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

	it('update는 use-case에 id·body를 위임하고 결과를 반환한다', async () => {
		const body = { name: 'new', is_active: false };
		const result = { id: 10, name: 'new' };
		(updateCampaignUseCase.execute as jest.Mock).mockResolvedValue(result);

		expect(await controller.update({ id: 10 }, body)).toBe(result);
		expect(updateCampaignUseCase.execute).toHaveBeenCalledWith(10, body);
	});

	it('get은 조회 use-case 결과를 반환한다', async () => {
		const campaign = { id: 10 };
		(getCampaignUseCase.execute as jest.Mock).mockResolvedValue(campaign);

		expect(await controller.get({ id: 10 })).toBe(campaign);
		expect(getCampaignUseCase.execute).toHaveBeenCalledWith(10);
	});

	it('list는 목록 use-case에 advertisingId를 위임한다', async () => {
		const list = [{ campaign_id: 3 }];
		(listCampaignUseCase.execute as jest.Mock).mockResolvedValue(list);

		expect(await controller.list({ advertisingId: 1 })).toBe(list);
		expect(listCampaignUseCase.execute).toHaveBeenCalledWith(1);
	});
});
