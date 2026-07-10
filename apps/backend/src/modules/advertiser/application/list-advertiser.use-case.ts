// advertiser 전체 목록을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { Advertiser } from '@advertiser/domain/advertiser.entity';
import { ADVERTISER_REPOSITORY, AdvertiserRepository } from '@advertiser/domain/advertiser.repository';

@Injectable()
export class ListAdvertiserUseCase {
	constructor(@Inject(ADVERTISER_REPOSITORY) private readonly advertiserRepository: AdvertiserRepository) {}

	async execute(): Promise<Advertiser[]> {
		return this.advertiserRepository.findAll();
	}
}
