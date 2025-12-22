import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Tracker } from '@module/tracker/dto/response';
import { TRACKER_REPOSITORY } from '@module/tracker/domain/symbol';
import { ITracker } from '@module/tracker/domain/repositories';

@Injectable()
export class GetTrackerListUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker) {}

	async execute() {
		const trackerList = await this.trackerRepository.findMany();
		return trackerList.map((tracker) => plainToInstance(Tracker, tracker, { excludeExtraneousValues: true }));
	}
}
