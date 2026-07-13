// advertising 정보(advertiser·tracker·연결 media)를 조회하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AdvertisingInfo } from '@advertising/domain/advertising.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';

@Injectable()
export class GetAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(id: number): Promise<AdvertisingInfo> {
		const info = await this.advertisingRepository.get(id);
		if (!info) {
			throw new NotFoundException();
		}

		return info;
	}
}
