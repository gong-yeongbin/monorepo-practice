// 날짜 범위 전체 일별 통계를 조회하는 use-case(admin excel 엔드포인트 = 필터 없는 조회)
import { Inject, Injectable } from '@nestjs/common';
import { DailyRow } from '@advertising/domain/statistics.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';
import { DailyDetailAllDto } from '@advertising/application/dto/statistics.dto';

@Injectable()
export class DailyDetailAllUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(dto: DailyDetailAllDto): Promise<DailyRow[]> {
		return this.advertisingRepository.dailyDetailAll({ start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) });
	}
}
