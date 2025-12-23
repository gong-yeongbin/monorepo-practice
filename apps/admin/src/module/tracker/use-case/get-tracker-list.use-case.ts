import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TRACKER_REPOSITORY } from '@tracker/domain/symbol';
import { ITracker } from '@tracker/domain/repositories';
import { Tracker } from '@tracker/dto/response';

@Injectable()
export class GetTrackerListUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker) {}

	async execute() {
		const trackerList = await this.trackerRepository.findMany();
		return trackerList.map((tracker) => plainToInstance(Tracker, tracker, { excludeExtraneousValues: true }));
	}
}
