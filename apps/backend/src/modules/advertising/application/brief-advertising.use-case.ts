// advertising 간략 목록(tracker명 포함)을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { AdvertisingBrief } from '@advertising/domain/advertising.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';

@Injectable()
export class BriefAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(): Promise<AdvertisingBrief[]> {
		return this.advertisingRepository.brief();
	}
}
