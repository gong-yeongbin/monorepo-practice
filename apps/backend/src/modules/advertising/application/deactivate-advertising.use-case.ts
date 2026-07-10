// advertising에 딸린 campaign을 전부 비활성화하는 use-case(admin patchAdvertisingStatus 재해석)
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';

@Injectable()
export class DeactivateAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(id: number): Promise<void> {
		if (!(await this.advertisingRepository.exists(id))) {
			throw new NotFoundException();
		}

		await this.advertisingRepository.deactivateCampaigns(id);
	}
}
