// 특정 일자의 advertising별 통계를 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { DashboardRow } from '@advertising/domain/statistics.entity';
import { ADVERTISING_REPOSITORY, AdvertisingRepository } from '@advertising/domain/advertising.repository';
import { DashboardDto } from '@advertising/application/dto/statistics.dto';

@Injectable()
export class DashboardUseCase {
	constructor(@Inject(ADVERTISING_REPOSITORY) private readonly advertisingRepository: AdvertisingRepository) {}

	async execute(dto: DashboardDto): Promise<DashboardRow[]> {
		return this.advertisingRepository.dashboard(new Date(dto.date));
	}
}
