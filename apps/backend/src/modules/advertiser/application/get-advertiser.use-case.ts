// advertiser 단건을 조회하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Advertiser } from '@advertiser/domain/advertiser.entity';
import { ADVERTISER_REPOSITORY, AdvertiserRepository } from '@advertiser/domain/advertiser.repository';

@Injectable()
export class GetAdvertiserUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: AdvertiserRepository) {}

	async execute(id: number): Promise<Advertiser> {
		const advertiser = await this.advertiserRepository.findById(id);
		if (!advertiser) {
			throw new NotFoundException();
		}

		return advertiser;
	}
}
