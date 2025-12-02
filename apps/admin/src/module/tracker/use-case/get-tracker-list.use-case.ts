import { Inject, Injectable } from '@nestjs/common';
import { ITracker, TRACKER_REPOSITORY } from '@module/tracker/domain';
import { plainToInstance } from 'class-transformer';
import { ResponseGetTrackerListDto } from '@module/tracker/dto/response';

@Injectable()
export class GetTrackerListUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker) {}

	async execute() {
		const trackerList = await this.trackerRepository.findMany();
		return trackerList?.map((tracker) => plainToInstance(ResponseGetTrackerListDto, { ...tracker }, { excludeExtraneousValues: true }));
	}
}
