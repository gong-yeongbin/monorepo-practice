import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReplaceConfigUseCase } from './replace-config.use-case';
import { CONFIG_REPOSITORY } from '@config/domain/config.repository';
import { ReplaceConfigDto } from '@config/application/dto/replace-config.dto';

describe('ReplaceConfigUseCase', () => {
	const configRepository = { campaignExists: jest.fn(), replace: jest.fn() };
	let useCase: ReplaceConfigUseCase;

	const configs: ReplaceConfigDto[] = [{ tracker_event_name: 'purchase', admin_event_name: 'purchase', media_event_name: 'purchase', send_media: true }];

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [ReplaceConfigUseCase, { provide: CONFIG_REPOSITORY, useValue: configRepository }],
		}).compile();

		useCase = module.get(ReplaceConfigUseCase);
	});

	it('campaign이 존재하면 config를 전체 교체한다', async () => {
		configRepository.campaignExists.mockResolvedValue(true);

		await useCase.execute(10, configs);

		expect(configRepository.replace).toHaveBeenCalledWith(10, configs);
	});

	it('campaign이 없으면 NotFoundException을 던지고 교체하지 않는다', async () => {
		configRepository.campaignExists.mockResolvedValue(false);

		await expect(useCase.execute(10, configs)).rejects.toThrow(NotFoundException);
		expect(configRepository.replace).not.toHaveBeenCalled();
	});
});
