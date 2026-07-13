// 존재·이름 중복을 검사하고 tracker를 전체 교체 수정하는 use-case
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Tracker } from '@tracker/domain/tracker.entity';
import { TRACKER_REPOSITORY, TrackerRepository } from '@tracker/domain/tracker.repository';
import { UpdateTrackerDto } from '@tracker/application/dto/update-tracker.dto';

@Injectable()
export class UpdateTrackerUseCase {
	constructor(@Inject(TRACKER_REPOSITORY) private readonly trackerRepository: TrackerRepository) {}

	async execute(id: number, dto: UpdateTrackerDto): Promise<Tracker> {
		if (!(await this.trackerRepository.findById(id))) {
			throw new NotFoundException();
		}

		// 이름을 다른 tracker가 이미 쓰고 있으면 충돌(자기 자신은 허용)
		const sameName = await this.trackerRepository.findByName(dto.name);
		if (sameName && sameName.id !== id) {
			throw new ConflictException('already exists tracker name');
		}

		return this.trackerRepository.update(id, {
			name: dto.name,
			tracking_url: dto.tracking_url,
			install_postback_url: dto.install_postback_url,
			event_postback_url: dto.event_postback_url,
		});
	}
}
