// token 기준 일별 통계를 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { DailyRow } from '@advertising/domain/statistics.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';
import { DailyDto } from '@advertising/application/dto/statistics.dto';

@Injectable()
export class DailyUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(dto: DailyDto): Promise<DailyRow[]> {
		return this.advertisingRepository.daily(dto.token, { start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) });
	}
}
