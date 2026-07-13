import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UpdateMediaUseCase } from './update-media.use-case';
import { MEDIA_REPOSITORY } from '@media/domain/media.repository';

describe('UpdateMediaUseCase', () => {
	const mediaRepository = { findById: jest.fn(), findByName: jest.fn(), update: jest.fn() };
	let useCase: UpdateMediaUseCase;

	const dto = { name: 'm2', install_postback_url: 'i', event_postback_url: 'e' };

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [UpdateMediaUseCase, { provide: MEDIA_REPOSITORY, useValue: mediaRepository }],
		}).compile();
		useCase = module.get(UpdateMediaUseCase);
	});

	it('존재하고 이름 충돌이 없으면 media를 수정한다', async () => {
		mediaRepository.findById.mockResolvedValue({ id: 1, name: 'm1' });
		mediaRepository.findByName.mockResolvedValue(null);
		const updated = { id: 1, ...dto };
		mediaRepository.update.mockResolvedValue(updated);

		expect(await useCase.execute(1, dto)).toBe(updated);
		expect(mediaRepository.update).toHaveBeenCalledWith(1, dto);
	});

	it('같은 이름을 쓰는 게 자기 자신이면 수정을 허용한다', async () => {
		mediaRepository.findById.mockResolvedValue({ id: 1, name: 'm2' });
		mediaRepository.findByName.mockResolvedValue({ id: 1, name: 'm2' });
		mediaRepository.update.mockResolvedValue({ id: 1, ...dto });

		await useCase.execute(1, dto);
		expect(mediaRepository.update).toHaveBeenCalledWith(1, dto);
	});

	it('존재하지 않으면 NotFoundException을 던진다', async () => {
		mediaRepository.findById.mockResolvedValue(null);

		await expect(useCase.execute(1, dto)).rejects.toThrow(NotFoundException);
		expect(mediaRepository.update).not.toHaveBeenCalled();
	});

	it('다른 media가 같은 이름을 쓰면 ConflictException을 던진다', async () => {
		mediaRepository.findById.mockResolvedValue({ id: 1, name: 'm1' });
		mediaRepository.findByName.mockResolvedValue({ id: 2, name: 'm2' });

		await expect(useCase.execute(1, dto)).rejects.toThrow(ConflictException);
		expect(mediaRepository.update).not.toHaveBeenCalled();
	});
});
