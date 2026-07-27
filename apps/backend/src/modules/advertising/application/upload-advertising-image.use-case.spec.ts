import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UploadAdvertisingImageUseCase } from './upload-advertising-image.use-case';
import { ADVERTISING_REPOSITORY } from '@advertising/domain/advertising.repository';
import { STORAGE_PORT } from '@infra/storage/storage.port';

describe('UploadAdvertisingImageUseCase', () => {
	const advertisingRepository = { exists: jest.fn(), updateImage: jest.fn() };
	const storage = { upload: jest.fn() };
	let useCase: UploadAdvertisingImageUseCase;

	const file = { buffer: Buffer.from('img'), mimetype: 'image/png' };

	beforeEach(async () => {
		jest.clearAllMocks();
		const module = await Test.createTestingModule({
			providers: [
				UploadAdvertisingImageUseCase,
				{ provide: ADVERTISING_REPOSITORY, useValue: advertisingRepository },
				{ provide: STORAGE_PORT, useValue: storage },
			],
		}).compile();
		useCase = module.get(UploadAdvertisingImageUseCase);
	});

	it('존재하면 안정 키로 업로드하고 반환된 URL을 저장한다', async () => {
		advertisingRepository.exists.mockResolvedValue(true);
		storage.upload.mockResolvedValue('https://bucket.s3.region.amazonaws.com/advertising/1');

		expect(await useCase.execute(1, file)).toEqual({ image: 'https://bucket.s3.region.amazonaws.com/advertising/1' });
		expect(storage.upload).toHaveBeenCalledWith({ key: 'advertising/1', body: file.buffer, contentType: 'image/png' });
		expect(advertisingRepository.updateImage).toHaveBeenCalledWith(1, 'https://bucket.s3.region.amazonaws.com/advertising/1');
	});

	it('존재하지 않으면 NotFoundException을 던지고 업로드·저장하지 않는다', async () => {
		advertisingRepository.exists.mockResolvedValue(false);

		await expect(useCase.execute(1, file)).rejects.toThrow(NotFoundException);
		expect(storage.upload).not.toHaveBeenCalled();
		expect(advertisingRepository.updateImage).not.toHaveBeenCalled();
	});
});
