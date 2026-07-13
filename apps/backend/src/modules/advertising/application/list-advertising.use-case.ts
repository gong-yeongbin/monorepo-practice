// advertising 목록(검색·페이징, tracker명·campaign 카운트·파생 status 포함)을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { AdvertisingListItem } from '@advertising/domain/advertising.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';
import { ListAdvertisingDto } from '@advertising/application/dto/list-advertising.dto';

@Injectable()
export class ListAdvertisingUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(dto: ListAdvertisingDto): Promise<AdvertisingListItem[]> {
		return this.advertisingRepository.list({ search: dto.search, offset: dto.offset, limit: dto.limit });
	}
}
