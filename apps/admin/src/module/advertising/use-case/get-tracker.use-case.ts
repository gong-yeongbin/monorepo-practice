import { Inject, Injectable } from '@nestjs/common';
import { TRACKER_REPOSITORY } from '@tracker/domain/symbol';
import { ITracker } from '@tracker/domain/repositories';

@Injectable()
export class GetTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: ITracker) {}

	async execute(trackerId: number) {
		const tracker = await this.trackerRepository.findById(trackerId);
		return tracker ? tracker.name : null;
	}
}
