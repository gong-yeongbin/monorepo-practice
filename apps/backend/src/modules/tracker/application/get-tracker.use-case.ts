// tracker 단건을 조회하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Tracker } from '@tracker/domain/tracker.entity';
import { TRACKER_REPOSITORY, TrackerRepository } from '@tracker/domain/tracker.repository';

@Injectable()
export class GetTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: TrackerRepository) {}

	async execute(id: number): Promise<Tracker> {
		const tracker = await this.trackerRepository.findById(id);
		if (!tracker) {
			throw new NotFoundException();
		}

		return tracker;
	}
}
