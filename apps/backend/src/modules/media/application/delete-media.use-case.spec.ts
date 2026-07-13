import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DeleteMediaUseCase } from './delete-media.use-case';
import { MEDIA_REPOSITORY } from '@media/domain/media.repository';

describe('DeleteMediaUseCase', () => {
	const mediaRepository = { findById: jest.fn(), countCampaign: jest.fn(), delete: jest.fn() };
	let useCase: DeleteMediaUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [DeleteMediaUseCase, { provide: MEDIA_REPOSITORY, useValue: mediaRepository }],
		}).compile();
		useCase = module.get(DeleteMediaUseCase);
	});

	it('참조하는 campaign이 없으면 media를 삭제한다', async () => {
		mediaRepository.findById.mockResolvedValue({ id: 1, name: 'm1' });
		mediaRepository.countCampaign.mockResolvedValue(0);

		await useCase.execute(1);
		expect(mediaRepository.delete).toHaveBeenCalledWith(1);
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		mediaRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
		expect(mediaRepository.delete).not.toHaveBeenCalled();
	});

	it('참조하는 campaign이 있으면 ConflictException을 던진다', async () => {
		mediaRepository.findById.mockResolvedValue({ id: 1, name: 'm1' });
		mediaRepository.countCampaign.mockResolvedValue(2);

		await expect(useCase.execute(1)).rejects.toThrow(ConflictException);
		expect(mediaRepository.delete).not.toHaveBeenCalled();
	});
});
