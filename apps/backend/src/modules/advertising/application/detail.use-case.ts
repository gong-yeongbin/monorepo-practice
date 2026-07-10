// advertising별 매체·캠페인 단위 상세 통계를 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { DetailRow } from '@advertising/domain/statistics.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';
import { DetailDto } from '@advertising/application/dto/statistics.dto';

@Injectable()
export class DetailUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(advertising_id: number, dto: DetailDto): Promise<DetailRow[]> {
		return this.advertisingRepository.detail(advertising_id, { start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) }, dto.media_id);
	}
}
