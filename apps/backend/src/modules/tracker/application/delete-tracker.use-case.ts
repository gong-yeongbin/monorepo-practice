// 참조 advertising이 없을 때만 tracker를 삭제하는 use-case
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TRACKER_REPOSITORY, TrackerRepository } from '@tracker/domain/tracker.repository';

@Injectable()
export class DeleteTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: TrackerRepository) {}

	async execute(id: number): Promise<void> {
		if (!(await this.trackerRepository.findById(id))) {
			throw new NotFoundException();
		}

		// advertising이 FK로 참조 중이면 DB가 삭제를 막으므로(ON DELETE RESTRICT) 사전에 거부한다
		if ((await this.trackerRepository.countAdvertising(id)) > 0) {
			throw new ConflictException('tracker is referenced by advertising');
		}

		await this.trackerRepository.delete(id);
	}
}
