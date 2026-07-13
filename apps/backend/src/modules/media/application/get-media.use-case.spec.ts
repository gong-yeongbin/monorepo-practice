import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetMediaUseCase } from './get-media.use-case';
import { MEDIA_REPOSITORY } from '@media/domain/media.repository';

describe('GetMediaUseCase', () => {
	const mediaRepository = { findById: jest.fn() };
	let useCase: GetMediaUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [GetMediaUseCase, { provide: MEDIA_REPOSITORY, useValue: mediaRepository }],
		}).compile();
		useCase = module.get(GetMediaUseCase);
	});

	it('존재하면 media를 반환한다', async () => {
		const media = { id: 1, name: 'm1', install_postback_url: 'i', event_postback_url: 'e' };
		mediaRepository.findById.mockResolvedValue(media);

		expect(await useCase.execute(1)).toBe(media);
	});

	it('없으면 NotFoundException을 던진다', async () => {
		mediaRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
	});
});
