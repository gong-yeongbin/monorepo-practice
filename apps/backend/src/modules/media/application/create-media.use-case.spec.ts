import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateMediaUseCase } from './create-media.use-case';
import { MEDIA_REPOSITORY } from '@media/domain/media.repository';

describe('CreateMediaUseCase', () => {
	const mediaRepository = { findByName: jest.fn(), create: jest.fn() };
	let useCase: CreateMediaUseCase;

	const dto = { name: 'm1', install_postback_url: 'i', event_postback_url: 'e' };

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [CreateMediaUseCase, { provide: MEDIA_REPOSITORY, useValue: mediaRepository }],
		}).compile();
		useCase = module.get(CreateMediaUseCase);
	});

	it('이름이 중복되지 않으면 media를 생성한다', async () => {
		mediaRepository.findByName.mockResolvedValue(null);
		const created = { id: 1, ...dto };
		mediaRepository.create.mockResolvedValue(created);

		expect(await useCase.execute(dto)).toBe(created);
		expect(mediaRepository.create).toHaveBeenCalledWith(dto);
	});

	it('이름이 이미 존재하면 ConflictException을 던진다', async () => {
		mediaRepository.findByName.mockResolvedValue({ id: 1, ...dto });

		await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
		expect(mediaRepository.create).not.toHaveBeenCalled();
	});
});
