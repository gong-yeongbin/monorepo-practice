// advertising 존재를 확인하고 이미지를 스토리지에 올린 뒤 URL을 저장하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';
import { STORAGE_PORT, StoragePort } from '@infra/storage/storage.port';

@Injectable()
export class UploadAdvertisingImageUseCase {
	constructor(
		@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository,
		@Inject(STORAGE_PORT) private readonly storage: StoragePort
	) {}

	async execute(id: number, file: { buffer: Buffer; mimetype: string }): Promise<{ image: string }> {
		if (!(await this.advertisingRepository.exists(id))) {
			throw new NotFoundException();
		}

		// 안정 키에 덮어써 고아 객체를 남기지 않는다(프론트가 ?uuid 캐시버스터로 갱신 표시)
		const image = await this.storage.upload({ key: `advertising/${id}`, body: file.buffer, contentType: file.mimetype });
		await this.advertisingRepository.updateImage(id, image);
		return { image };
	}
}
