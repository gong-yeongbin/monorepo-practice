// tracker 전체 목록을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { Tracker } from '@tracker/domain/tracker.entity';
import { TRACKER_REPOSITORY, TrackerRepository } from '@tracker/domain/tracker.repository';

@Injectable()
export class ListTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: TrackerRepository) {}

	async execute(): Promise<Tracker[]> {
		return this.trackerRepository.findAll();
	}
}
